import { env } from '$env/dynamic/private';
import { token } from './util/token';
import {
	setOauthState,
	updateOauthConnection,
	getAccessToken,
	deleteConnection,
	updateOauthAccountInfo,
	getRefreshToken
} from './oauth_connection';
import HttpStatusCode from '$lib/shared/HttpStatusCode';
import { dev } from '$app/environment';
import type { JsonObject } from '@prisma/client/runtime/client';
import { createHmac, timingSafeEqual } from 'node:crypto';
import option from './option';
import type { PolarFlowProfile } from '$lib/shared/types';

const POLARFLOW_WEBHOOK_SECRET_KEY = 'polarflow.webhook.signature_secret';

class PolarFlow {
	#recordType = 'polar.activity.v1';

	#getRedirectUrl() {
		return dev
			? 'https://redir.monilo.org/http://localhost:5173/oauth/polarflow/callback'
			: `${env.ORIGIN}/oauth/polarflow/callback`;
	}

	#getWebhookCallbackUrl(): string {
		return `${env.ORIGIN}/api/webhook/polarflow`;
	}

	#getBasicAuthHeader(): string {
		return (
			'Basic ' +
			Buffer.from(`${env.POLARFLOW_CLIENT_ID}:${env.POLARFLOW_CLIENT_SECRET}`).toString('base64')
		);
	}

	async init(): Promise<void> {
		await this.#registerWebhook();
	}

	async getAuthUrl(user_id: string): Promise<string> {
		const url = new URL('https://auth.polar.com/oauth/authorize');
		url.searchParams.append('response_type', 'code');
		// https://www.polar.com/polar-api-v4/#scopes
		const SCOPES = ['profile:read', 'training_sessions:read'];
		url.searchParams.append('scope', SCOPES.join(' '));
		url.searchParams.append('client_id', env.POLARFLOW_CLIENT_ID as string);
		url.searchParams.append('redirect_uri', this.#getRedirectUrl());
		const state = token();
		url.searchParams.append('state', state);
		await setOauthState(user_id, 'polarflow', state);
		return url.toString();
	}

	async receiveAccessToken(user_id: string, oauth_code: string): Promise<boolean> {
		const searchParams = new URLSearchParams();
		searchParams.append('grant_type', 'authorization_code');
		searchParams.append('code', oauth_code);
		searchParams.append('redirect_uri', this.#getRedirectUrl());
		const polarClientAuth = Buffer.from(
			`${env.POLARFLOW_CLIENT_ID}:${env.POLARFLOW_CLIENT_SECRET}`
		).toString('base64');
		const res = await fetch('https://auth.polar.com/oauth/token', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				Authorization: `Basic ${polarClientAuth}`,
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: searchParams
		});

		if (!res.ok) {
			const body = await res.json();
			console.error('PolarFlow receiveAccessToken failed', res.status, body);
			return false;
		}

		const body = await res.json();
		await updateOauthConnection(
			user_id,
			'polarflow',
			body.access_token,
			body.refresh_token,
			body.expires_in
		);
		const profile = await this.fetchProfile(user_id);
		if (profile === null) {
			console.error('PolarFlow profile failed');
			// rollback oauth connection, we require a successfull fetchProfile call
			await this.delete(user_id);
			return false;
		}
		await updateOauthAccountInfo(user_id, 'polarflow', profile, profile.basicInfo.email);
		return true;
	}

	async #getAccessToken(user_id: string): Promise<string | null> {
		const access_token = await getAccessToken(user_id, 'polarflow');
		if (access_token) {
			return access_token;
		}

		const refresh_token = await getRefreshToken(user_id, 'polarflow');
		if (refresh_token === null) {
			// not connected or no refresh token in the db
			return null;
		}
		const searchParams = new URLSearchParams();
		searchParams.append('grant_type', 'refresh_token');
		searchParams.append('refresh_token', refresh_token);
		const polarClientAuth = Buffer.from(
			`${env.POLARFLOW_CLIENT_ID}:${env.POLARFLOW_CLIENT_SECRET}`
		).toString('base64');
		const res = await fetch('https://auth.polar.com/oauth/token', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				Authorization: `Basic ${polarClientAuth}`,
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: searchParams
		});

		if (!res.ok) {
			const body = await res.json();
			console.error('PolarFlow getAccessToken failed', res.status, body);
			return null;
		}

		const body = await res.json();
		await updateOauthConnection(
			user_id,
			'polarflow',
			body.access_token,
			body.refresh_token,
			body.expires_in
		);
		return body.access_token;
	}

	async #fetch<T>(
		user_id: string,
		path: string,
		options: RequestInit = {}
	): Promise<[boolean, T | null]> {
		const access_token = await this.#getAccessToken(user_id);
		if (access_token === null) {
			console.error('PolarFlow fetch no access_token');
			return [false, null];
		}
		const base_url = 'https://www.polaraccesslink.com/v4/data';
		const url = new URL(base_url + path);
		const res = await fetch(url, {
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				Authorization: `Bearer ${access_token}`,
				...options.headers
			},
			...options
		});

		if (!res.ok) {
			const data = await res.text();
			console.error('polarflow: failed request', res.status, data);
			return [false, null];
		}

		if (res.status === HttpStatusCode.NO_CONTENT) {
			return [true, null];
		}

		const data = await res.json();
		return [true, data];
	}

	async delete(user_id: string): Promise<boolean> {
		await deleteConnection(user_id, 'polarflow');
		return true;
	}

	async fetchProfile(user_id: string): Promise<PolarFlowProfile | null> {
		const [_, user] = await this.#fetch<PolarFlowProfile>(user_id, `/user/account-data`);
		return user;
	}

	/**
	 * Register the app-level Polar AccessLink webhook. Only a single webhook
	 * is allowed per client application.
	 * https://www.polar.com/accesslink-api/#webhooks
	 *
	 * On creation Polar returns a `signature_secret_key` that is required to
	 * verify incoming webhook payloads. This key cannot be retrieved later,
	 * so it is persisted in the Option store.
	 */
	async #registerWebhook(): Promise<void> {
		if (dev) {
			console.info('polarflow: skipping webhook registration in dev');
			return;
		}
		if (!env.POLARFLOW_CLIENT_ID || !env.POLARFLOW_CLIENT_SECRET || !env.ORIGIN) {
			console.warn('polarflow: missing env, skipping webhook registration');
			return;
		}

		const callback_url = this.#getWebhookCallbackUrl();
		try {
			const getRes = await fetch('https://www.polaraccesslink.com/v3/webhooks', {
				headers: {
					Accept: 'application/json',
					Authorization: this.#getBasicAuthHeader()
				}
			});

			if (getRes.ok) {
				const body = await getRes.json();
				const existing = body?.data;
				const haveSecret = (await option.get(POLARFLOW_WEBHOOK_SECRET_KEY)) !== null;
				if (existing?.url === callback_url && haveSecret) {
					console.info('polarflow: webhook already registered, id=', existing.id);
					return;
				}
				if (existing?.id) {
					console.warn('polarflow: deleting existing webhook to recreate', existing.url);
					await fetch(`https://www.polaraccesslink.com/v3/webhooks/${existing.id}`, {
						method: 'DELETE',
						headers: { Authorization: this.#getBasicAuthHeader() }
					});
					await option.delete(POLARFLOW_WEBHOOK_SECRET_KEY);
				}
			} else if (getRes.status !== HttpStatusCode.NOT_FOUND) {
				console.error('polarflow: failed to get webhook', getRes.status, await getRes.text());
				return;
			}

			const createRes = await fetch('https://www.polaraccesslink.com/v3/webhooks', {
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
					Authorization: this.#getBasicAuthHeader()
				},
				body: JSON.stringify({
					events: ['EXERCISE'],
					url: callback_url
				})
			});
			if (!createRes.ok) {
				console.error(
					'polarflow: failed to register webhook',
					createRes.status,
					await createRes.text()
				);
				return;
			}
			const created = await createRes.json();
			const signature_secret_key = created?.data?.signature_secret_key;
			if (typeof signature_secret_key === 'string') {
				await option.set(POLARFLOW_WEBHOOK_SECRET_KEY, signature_secret_key);
			} else {
				console.error('polarflow: webhook created but no signature_secret_key returned');
			}
			console.info('polarflow: webhook registered, id=', created?.data?.id);
		} catch (err) {
			console.error('polarflow: webhook registration error', err);
		}
	}

	/**
	 * Verify the HMAC-SHA256 signature of a webhook POST.
	 * Signature is sent in the `Polar-Webhook-Signature` header as a hex digest
	 * of the raw payload signed with the `signature_secret_key` issued at
	 * webhook creation time (persisted in the Option store).
	 */
	async verifyWebhookSignature(signatureHeader: string | null, rawBody: string): Promise<boolean> {
		if (!signatureHeader) {
			return false;
		}
		const secret = await option.get(POLARFLOW_WEBHOOK_SECRET_KEY);
		if (typeof secret !== 'string') {
			return false;
		}
		const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
		const a = Buffer.from(signatureHeader);
		const b = Buffer.from(expected);
		if (a.length !== b.length) return false;
		return timingSafeEqual(a, b);
	}

	async fetchActivities(user_id: string): Promise<JsonObject[]> {
		const startDate = new Date();
		startDate.setDate(startDate.getDate() - 7);
		const endDate = new Date();
		const searchParams = new URLSearchParams();
		searchParams.append('from', startDate.toISOString().split('.')[0]);
		searchParams.append('to', endDate.toISOString().split('.')[0]);
		const [success, activities] = await this.#fetch<JsonObject[]>(
			user_id,
			'/training-sessions/list?' + searchParams.toString()
		);
		if (!success || activities === null) {
			return [];
		}
		return activities;
	}
}

const instance = new PolarFlow();
export default instance;
