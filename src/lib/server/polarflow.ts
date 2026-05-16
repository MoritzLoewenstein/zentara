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

class PolarFlow {
	#getRedirectUrl() {
		return dev
			? 'https://redir.monilo.org/http://localhost:5173/oauth/polarflow/callback'
			: `${env.ORIGIN}/oauth/polarflow/callback`;
	}

	async getAuthUrl(user_id: string): Promise<string> {
		const url = new URL('https://auth.polar.com/oauth/authorize');
		url.searchParams.append('response_type', 'code');
		// https://www.polar.com/polar-api-v4/#scopes
		const SCOPES = ['profile:read', 'activity:read'];
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
			'',
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
		await updateOauthAccountInfo(user_id, 'polarflow', profile);
		return true;
	}

	async getAccessToken(user_id: string): Promise<string | null> {
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
			'',
			body.access_token,
			body.refresh_token,
			body.expires_in
		);
		return body.access_token;
	}

	async fetch<T>(
		user_id: string,
		path: string,
		options: RequestInit = {}
	): Promise<[boolean, T | null]> {
		const access_token = await getAccessToken(user_id, 'polarflow');
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

	async fetchProfile(user_id: string): Promise<JsonObject | null> {
		const [_, user] = await this.fetch<JsonObject>(user_id, `/user/account-data`);
		return user;
	}

	async fetchActivities(user_id: string): Promise<JsonObject[]> {
		const startDate = new Date();
		startDate.setMonth(10);
		startDate.setDate(1);
		const endDate = new Date();
		endDate.setMonth(10);
		endDate.setDate(28);
		const searchParams = new URLSearchParams();
		searchParams.append('from', startDate.toISOString().split('T')[0]);
		searchParams.append('to', endDate.toISOString().split('T')[0]);
		const [success, activities] = await this.fetch<JsonObject[]>(
			user_id,
			'/activity/list?' + searchParams.toString()
		);
		if (!success || activities === null) {
			return [];
		}
		return activities;
	}
}

const instance = new PolarFlow();
export default instance;
