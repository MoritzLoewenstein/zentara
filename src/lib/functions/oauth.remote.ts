import { z } from 'zod';
import { command } from '$app/server';
import polarflow from '$lib/server/polarflow';
import { getRequestEvent, query } from '$app/server';
import { error } from '@sveltejs/kit';
import HttpStatusCode from '$lib/shared/HttpStatusCode';
import { getSessionUserInfo, updateSession } from '$lib/server/session';
import { getUnauthorizedData } from '../../routes/+page.server';

export const disconnectProvider = command(z.literal(['polarflow', 'strava']), async (provider) => {
	const user = await getUser();
	if (provider === 'polarflow') {
		const result = polarflow.deleteUser(user.id);
        return result;
	} else {
		return error(HttpStatusCode.NOT_IMPLEMENTED);
	}
});

const getUser = query(async () => {
	const { cookies, url } = getRequestEvent();
	const session_id = cookies.get('session_id');
	if (!session_id) {
		const data = await getUnauthorizedData(url.searchParams);
		return error(HttpStatusCode.UNAUTHORIZED, { message: 'unauthorized', ...data } as App.Error);
	}

	const user = await getSessionUserInfo(session_id);
	if (!user) {
		const data = await getUnauthorizedData(url.searchParams);
		return error(HttpStatusCode.UNAUTHORIZED, { message: 'unauthorized', ...data } as App.Error);
	}
	await updateSession(session_id);

	return user;
});
