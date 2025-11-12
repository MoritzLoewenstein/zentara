import { env } from '$env/dynamic/private';
import { token } from './util/token';
import {
	setOauthState,
	updateOauthConnection,
	getAccessToken,
	getOauthAccountId,
	deleteConnection,
	updateOauthAccountInfo
} from './oauth_connection';
import HttpStatusCode from '$lib/shared/HttpStatusCode';
import { dev } from '$app/environment';

class PolarFlow {
	#getRedirectUrl() {
		return dev
			? 'https://redir.monilo.org/http://localhost:5173/oauth/polarflow/callback'
			: `${env.ORIGIN}/oauth/polarflow/callback`;
	}

	async getAuthUrl(user_id: string): Promise<string> {
		const url = new URL('https://flow.polar.com/oauth2/authorization');
		url.searchParams.append('response_type', 'code');
		url.searchParams.append('client_id', env.POLARFLOW_CLIENT_ID as string);
		url.searchParams.append('redirect_uri', this.#getRedirectUrl());
		const state = token();
		url.searchParams.append('state', state);
		await setOauthState(user_id, 'polarflow', state);
		return url.toString();
	}

	async getAccessToken(user_id: string, oauth_code: string): Promise<boolean> {
		const searchParams = new URLSearchParams();
		searchParams.append('grant_type', 'authorization_code');
		searchParams.append('code', oauth_code);
		searchParams.append('redirect_uri', this.#getRedirectUrl());
		const polarClientAuth = Buffer.from(
			`${env.POLARFLOW_CLIENT_ID}:${env.POLARFLOW_CLIENT_SECRET}`
		).toString('base64');
		const res = await fetch('https://polarremote.com/v2/oauth2/token', {
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
			return false;
		}

		const body = await res.json();
		await updateOauthConnection(user_id, 'polarflow', body.access_token, body.x_user_id.toString());
		const userInfo = await this.registerUser(user_id);
		if(!userInfo) {
			console.error("PolarFlow UserRegister failed");
			return false;
		}
		await updateOauthAccountInfo(user_id, "polarflow", userInfo)
		return true;
	}

	async fetchPartner(path: string, options: RequestInit = {}): Promise<unknown> {
		const base_url = 'https://www.polaraccesslink.com/v3';
		const url = new URL(base_url + path);
		const polarClientAuth = Buffer.from(
			`${env.POLARFLOW_CLIENT_ID}:${env.POLARFLOW_CLIENT_SECRET}`
		).toString('base64');
		const res = await fetch(url, {
			headers: {
				Accept: 'application/json',
				"Content-Type": "application/json",
				Authorization: `Basic ${polarClientAuth}`
			},
			...options
		});

		if (!res.ok) {
			const data = await res.text();
			console.error('polarflow: failed request', res.status, data);
			return null;
		}

		if (res.status === HttpStatusCode.NO_CONTENT) {
			return null;
		}

		const data = await res.json();
		return data;
	}

	async fetchUser(user_id: string, path: string, options: RequestInit = {}): Promise<unknown> {
		const access_token = await getAccessToken(user_id, 'polarflow');
		const base_url = 'https://www.polaraccesslink.com/v3';
		const url = new URL(base_url + path);
		const res = await fetch(url, {
			headers: {
				Accept: 'application/json',
				"Content-Type": "application/json",
				Authorization: `Bearer ${access_token}`,
				...options.headers
			},
			...options
		});

		if (!res.ok) {
			const data = await res.text();
			console.error('polarflow: failed request', res.status, data);
			return null;
		}

		if (res.status === HttpStatusCode.NO_CONTENT) {
			return true;
		}

		const data = await res.json();
		return data;
	}

	async registerUser(user_id: string): Promise<unknown> {
		const body = await this.fetchUser(user_id, '/users', {
			method: 'POST',
			body: JSON.stringify({ 'member-id': user_id  })
		});
		return body;
	}

	async deleteUser(user_id: string): Promise<boolean> {
		const polar_user_id = await getOauthAccountId(user_id, 'polarflow');
		if (!polar_user_id) {
			return false;
		}

		const result = await this.fetchUser(user_id, `/users/${polar_user_id}`, {
			method: 'DELETE'
		});
		if(result !== true) {
			return false;
		}

		await deleteConnection(user_id, "polarflow");
		return true;
	}

	async getUser(user_id: string): Promise<unknown> {
		const polar_user_id = await getOauthAccountId(user_id, 'polarflow');
		if (!polar_user_id) {
			return null;
		}

		const user = await this.fetchUser(user_id, `/users/${polar_user_id}`);
		return user;
	}

	async getExercises(user_id: string): Promise<unknown> {
		const exercises = await this.fetchUser(user_id, '/exercises');
		return exercises;
	}
}

const instance = new PolarFlow();
export default instance;
