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

class Strava {
	#getRedirectUrl() {
		return dev
			? 'http://localhost:5173/oauth/strava/callback'
			: `${env.ORIGIN}/oauth/strava/callback`;
	}

	async getAuthUrl(user_id: string): Promise<string> {
		const url = new URL('https://www.strava.com/oauth/authorize');
		url.searchParams.append('response_type', 'code');
		// https://developers.strava.com/docs/authentication/#detailsaboutrequestingaccess
		const SCOPES = ['read', 'activity:read', 'profile:read_all'];
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

	async getAccessToken(user_id: string): Promise<string | null> {
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

	async fetch<T>(
		user_id: string,
		path: string,
		options: RequestInit = {}
	): Promise<[boolean, T | null]> {
		const access_token = await getAccessToken(user_id, 'strava');
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
		const [_, athlete] = await this.fetch<JsonObject>(user_id, '/athlete');
		return athlete;
	}
}

const instance = new Strava();
export default instance;
