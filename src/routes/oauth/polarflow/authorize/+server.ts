import { redirect, error } from '@sveltejs/kit';
import { getSessionUserInfo } from '$lib/server/session';
import polarflow from '$lib/server/polarflow';
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

	const auth_url = await polarflow.getAuthUrl(user.id);
	return redirect(HttpStatusCode.SEE_OTHER, auth_url);
};
