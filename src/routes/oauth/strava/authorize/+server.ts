import { redirect, error } from '@sveltejs/kit';
import { getSessionUserInfo } from '$lib/server/session';
import strava from '$lib/server/strava';
import type { RequestHandler } from './$types';
import HttpStatusCode from '$lib/shared/HttpStatusCode';

export const GET: RequestHandler = async ({ cookies }) => {
	const session_id = cookies.get('session_id');
	if (!session_id) {
		return error(HttpStatusCode.UNAUTHORIZED, { message: 'unauthorized', code: 'unauthorized' });
	}

	const user = await getSessionUserInfo(session_id);
	if (!user) {
		return error(HttpStatusCode.UNAUTHORIZED, { message: 'unauthorized', code: 'unauthorized' });
	}

	const auth_url = await strava.getAuthUrl(user.id);
	return redirect(HttpStatusCode.SEE_OTHER, auth_url);
};
