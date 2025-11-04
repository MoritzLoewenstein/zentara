import { env } from '$env/dynamic/private';
import { token } from './util/token';
import { setOauthState, setAccessToken } from './oauth_connection';
import HttpStatusCode from '$lib/shared/HttpStatusCode';

class PolarFlow {
	async getAuthUrl(user_id: string): Promise<string> {
		const url = new URL('https://flow.polar.com/oauth2/authorization');
		url.searchParams.append('response_type', 'code');
		url.searchParams.append('client_id', env.POLARFLOW_CLIENT_ID as string);
		url.searchParams.append('redirect_uri', `${env.ORIGIN}/oauth/polarflow/callback`);
		const state = token();
		url.searchParams.append('state', state);
		await setOauthState(user_id, 'polarflow', state);
		return url.toString();
	}

	async getAccessToken(user_id: string, oauth_code: string): Promise<boolean> {
		const searchParams = new URLSearchParams();
		searchParams.append('grant_type', 'authorization_code');
		searchParams.append('code', oauth_code);
		searchParams.append('redirect_uri', `${env.ORIGIN}/oauth/polarflow/callback`);
		const res = await fetch('https://polarremote.com/v2/oauth2/token', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: searchParams
		}).then((r) => r.json());

		if (res.error) {
			console.error('PolarFlow getAccessToken failed', res);
			return false;
		}

		await setAccessToken(user_id, 'polarflow', res.access_token);
		return true;
	}

	async fetch(path: string, options: RequestInit): Promise<unknown> {
		const base_url = 'https://www.polaraccesslink.com/v3/';
		const url = new URL(base_url + path);
		const res = await fetch(url, {
			headers: {
				Accept: 'application/json',
				Authorization: `Bearer ${'stub'}`
			},
			...options
		});

		if (!res.ok) {
			const data = await res.text();
			console.error('polarflow: failed request', data);
			return null;
		}

		if (res.status === HttpStatusCode.NO_CONTENT) {
			return null;
		}

		const data = await res.json();
		return data;
	}
}

const instance = new PolarFlow();
export default instance;
