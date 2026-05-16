import { redirect, error } from '@sveltejs/kit';
import { getSessionUserInfo } from '$lib/server/session';
import { verifyOauthState } from '$lib/server/oauth_connection';
import strava from '$lib/server/strava';
import type { RequestHandler } from './$types';
import HttpStatusCode from '$lib/shared/HttpStatusCode';

export const GET: RequestHandler = async ({ url, cookies }) => {
	const session_id = cookies.get('session_id');
	if (!session_id) {
		return error(HttpStatusCode.UNAUTHORIZED, { message: 'unauthorized', code: 'unauthorized' });
	}

	const user = await getSessionUserInfo(session_id);
	if (!user) {
		return error(HttpStatusCode.UNAUTHORIZED, { message: 'unauthorized', code: 'unauthorized' });
	}

	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');

	//TODO error state display in AccountConnections.svelte

	if (!code || !state) {
		return redirect(HttpStatusCode.SEE_OTHER, '/?error=missing_params');
	}

	const state_valid = await verifyOauthState(user.id, 'strava', state);
	if (!state_valid) {
		return redirect(HttpStatusCode.SEE_OTHER, '/?error=invalid_state');
	}

	const success = await strava.receiveAccessToken(user.id, code);
	if (!success) {
		return redirect(HttpStatusCode.SEE_OTHER, '/?error=token_exchange_failed');
	}

	return redirect(HttpStatusCode.SEE_OTHER, '/?oauth_success=strava');
};
