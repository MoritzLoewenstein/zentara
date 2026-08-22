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
import { cuid } from './util/cuid';

const STRAVA_WEBHOOK_VERIFY_TOKEN_KEY = 'strava.webhook.verify_token';

class Strava {
	#recordType: string | null = null;

	#getRedirectUrl() {
		return dev
			? 'http://localhost:5173/oauth/strava/callback'
			: `${env.ORIGIN}/oauth/strava/callback`;
	}

	#getWebhookCallbackUrl(): string {
		return dev
			? 'https://hooks.monilo.org/hook/01KRVSRT0A6VTXKBN3DYVQEKMB'
			: `${env.ORIGIN}/api/webhook/strava`;
	}

	async init(): Promise<void> {
		const [recordType] = await Promise.all([
			option.getOrInsert<string>('STRAVA_RECORD_TYPE', cuid()),
			this.#registerWebhook()
		]);
		this.#recordType = recordType;
	}

	async getAuthUrl(user_id: string): Promise<string> {
		const url = new URL('https://www.strava.com/oauth/authorize');
		url.searchParams.append('response_type', 'code');
		// https://developers.strava.com/docs/authentication/#detailsaboutrequestingaccess
		const SCOPES = ['read', 'activity:read_all', 'profile:read_all'];
		url.searchParams.append('scope', SCOPES.join(','));
		url.searchParams.append('client_id', env.STRAVA_CLIENT_ID);
		url.searchParams.append('redirect_uri', this.#getRedirectUrl());
		const state = token();
		url.searchParams.append('state', state);
		await setOauthState(user_id, 'strava', state);
		return url.toString();
	}

	async receiveAccessToken(user_id: string, oauth_code: string): Promise<boolean> {
		const searchParams = new URLSearchParams();
		searchParams.append('client_id', env.STRAVA_CLIENT_ID);
		searchParams.append('client_secret', env.STRAVA_CLIENT_SECRET);
		searchParams.append('grant_type', 'authorization_code');
		searchParams.append('code', oauth_code);
		const res = await fetch('https://www.strava.com/oauth/token', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: searchParams
		});

		if (!res.ok) {
			const body = await res.json();
			console.error('Strava receiveAccessToken failed', res.status, body);
			return false;
		}

		const body = await res.json();
		const athlete_id = body.athlete?.id ? String(body.athlete.id) : '';
		await updateOauthConnection(
			user_id,
			'strava',
			athlete_id,
			body.access_token,
			body.refresh_token,
			body.expires_in
		);
		const profile = await this.fetchProfile(user_id);
		if (profile === null) {
			console.error('Strava profile failed');
			// rollback oauth connection, we require a successfull fetchProfile call
			//await this.delete(user_id);
			return false;
		}
		await updateOauthAccountInfo(user_id, 'strava', profile);
		return true;
	}

	async #getAccessToken(user_id: string): Promise<string | null> {
		const access_token = await getAccessToken(user_id, 'strava');
		if (access_token) {
			return access_token;
		}

		const refresh_token = await getRefreshToken(user_id, 'strava');
		if (refresh_token === null) {
			// not connected or no refresh token in the db
			return null;
		}
		const searchParams = new URLSearchParams();
		searchParams.append('client_id', env.STRAVA_CLIENT_ID);
		searchParams.append('client_secret', env.STRAVA_CLIENT_SECRET);
		searchParams.append('grant_type', 'refresh_token');
		searchParams.append('refresh_token', refresh_token);
		const res = await fetch('https://www.strava.com/oauth/token', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: searchParams
		});

		if (!res.ok) {
			const body = await res.json();
			console.error('Strava getAccessToken failed', res.status, body);
			return null;
		}

		const body = await res.json();
		await updateOauthConnection(
			user_id,
			'strava',
			'',
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
			console.error('Strava fetch no access_token');
			return [false, null];
		}
		const base_url = 'https://www.strava.com/api/v3';
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
			console.error('strava: failed request', res.status, data);
			return [false, null];
		}

		if (res.status === HttpStatusCode.NO_CONTENT) {
			return [true, null];
		}

		const data = await res.json();
		return [true, data];
	}

	async delete(user_id: string): Promise<boolean> {
		await deleteConnection(user_id, 'strava');
		return true;
	}

	async fetchProfile(user_id: string): Promise<JsonObject | null> {
		const [_, athlete] = await this.#fetch<JsonObject>(user_id, '/athlete');
		return athlete;
	}

	/**
	 * Register the app-level webhook subscription with Strava.
	 * Strava only allows a single subscription per application.
	 * https://developers.strava.com/docs/webhooks/
	 */
	async #registerWebhook(): Promise<void> {
		if (dev) {
			console.info('strava: skipping webhook registration in dev');
			return;
		}
		if (!env.STRAVA_CLIENT_ID || !env.STRAVA_CLIENT_SECRET || !env.ORIGIN) {
			console.warn('strava: missing env, skipping webhook registration');
			return;
		}

		const callback_url = this.#getWebhookCallbackUrl();
		try {
			const listUrl = new URL('https://www.strava.com/api/v3/push_subscriptions');
			listUrl.searchParams.append('client_id', env.STRAVA_CLIENT_ID);
			listUrl.searchParams.append('client_secret', env.STRAVA_CLIENT_SECRET);
			const listRes = await fetch(listUrl);
			if (!listRes.ok) {
				console.error(
					'strava: failed to list webhook subscriptions',
					listRes.status,
					await listRes.text()
				);
				return;
			}
			const subs: Array<{ id: number; callback_url: string }> = await listRes.json();
			const matching = subs.find((s) => s.callback_url === callback_url);
			if (matching) {
				console.info('strava: webhook already registered, id=', matching.id);
				return;
			}

			// remove any stale subscriptions pointing somewhere else
			for (const sub of subs) {
				const delUrl = new URL(`https://www.strava.com/api/v3/push_subscriptions/${sub.id}`);
				delUrl.searchParams.append('client_id', env.STRAVA_CLIENT_ID);
				delUrl.searchParams.append('client_secret', env.STRAVA_CLIENT_SECRET);
				await fetch(delUrl, { method: 'DELETE' });
			}

			const verify_token = token();
			await option.set(STRAVA_WEBHOOK_VERIFY_TOKEN_KEY, verify_token);
			const createBody = new URLSearchParams();
			createBody.append('client_id', env.STRAVA_CLIENT_ID);
			createBody.append('client_secret', env.STRAVA_CLIENT_SECRET);
			createBody.append('callback_url', callback_url);
			createBody.append('verify_token', verify_token);

			const createRes = await fetch('https://www.strava.com/api/v3/push_subscriptions', {
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				body: createBody
			});
			if (!createRes.ok) {
				console.error(
					'strava: failed to register webhook',
					createRes.status,
					await createRes.text()
				);
				await option.delete(STRAVA_WEBHOOK_VERIFY_TOKEN_KEY);
				return;
			}
			const created = await createRes.json();
			console.info('strava: webhook registered, id=', created.id);
		} catch (err) {
			console.error('strava: webhook registration error', err);
			await option.delete(STRAVA_WEBHOOK_VERIFY_TOKEN_KEY);
		}
	}

	/**
	 * Validate the GET callback handshake from Strava and return the challenge
	 * value to be echoed back, or null if validation fails.
	 */
	async verifySubscriptionChallenge(params: URLSearchParams): Promise<string | null> {
		const mode = params.get('hub.mode');
		const challenge = params.get('hub.challenge');
		const verify_token = params.get('hub.verify_token');
		if (mode !== 'subscribe' || !challenge || !verify_token) {
			return null;
		}
		const stored = await option.get(STRAVA_WEBHOOK_VERIFY_TOKEN_KEY);
		if (typeof stored !== 'string') {
			return null;
		}
		const a = Buffer.from(verify_token);
		const b = Buffer.from(stored);
		if (a.length !== b.length || !timingSafeEqual(a, b)) {
			return null;
		}
		// single-use
		await option.delete(STRAVA_WEBHOOK_VERIFY_TOKEN_KEY);
		return challenge;
	}

	/**
	 * Verify the HMAC-SHA256 signature of a webhook event POST.
	 * Header format: `t=<unix>,v1=<hex>`.
	 * The signing secret is the Strava client_secret (the only shared secret).
	 */
	verifyWebhookSignature(signatureHeader: string | null, rawBody: string): boolean {
		if (!signatureHeader || !env.STRAVA_CLIENT_SECRET) {
			return false;
		}
		const parts: Record<string, string> = {};
		for (const piece of signatureHeader.split(',')) {
			const eq = piece.indexOf('=');
			if (eq === -1) continue;
			parts[piece.slice(0, eq).trim()] = piece.slice(eq + 1).trim();
		}
		const t = parts.t;
		const v1 = parts.v1;
		if (!t || !v1) return false;
		const tNum = Number(t);
		if (!Number.isFinite(tNum) || Math.abs(Date.now() / 1000 - tNum) > 300) {
			return false;
		}
		const expected = createHmac('sha256', env.STRAVA_CLIENT_SECRET)
			.update(`${t}.${rawBody}`)
			.digest('hex');
		const a = Buffer.from(v1);
		const b = Buffer.from(expected);
		if (a.length !== b.length) return false;
		return timingSafeEqual(a, b);
	}

	async fetchActivities(user_id: string): Promise<JsonObject[] | null> {
		const startDate = new Date();
		startDate.setMonth(startDate.getMonth() - 1);
		const endDate = new Date();
		const searchParams = new URLSearchParams();
		searchParams.append('after', (startDate.getTime() / 1000).toFixed(0));
		searchParams.append('before', (endDate.getTime() / 1000).toFixed(0));
		const [success, activities] = await this.#fetch<JsonObject[]>(
			user_id,
			'/athlete/activities?' + searchParams.toString()
		);
		if (!success || activities === null) {
			return [];
		}
		return activities;
	}
}

const instance = new Strava();
export default instance;
