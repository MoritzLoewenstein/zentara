import { error } from '@sveltejs/kit';
import {
	createSession,
	getSessionUserInfo,
	updateSession,
	SESSION_MAX_AGE
} from '$lib/server/session';
import { isFirstUser, loginUser, createFirstUser } from '$lib/server/user';

/** @type {import('@sveltejs/kit').ServerLoad} */
export function load({ cookies, url, locals }) {
	const firstUser = isFirstUser();
	if (firstUser) {
		return error(401, {
			message: 'Unauthorized',
			code: 'unauthorized_first_user'
		});
	}
	const session_id = cookies.get('session_id');
	if (!session_id) {
		const code = url.searchParams.get('recovery_code') ? 'recovery_code' : 'unauthorized';
		return error(401, { message: 'Unauthorized', code });
	}

	const user = getSessionUserInfo(session_id);
	if (!user) {
		return error(401, { message: 'Unauthorized', code: 'unauthorized' });
	}
	updateSession(session_id);
	locals.session_id = session_id;
	locals.user = user;

	return { user };
}

/** @satisfies {import('./$types').Actions} */
export const actions = {
	login: async ({ request, cookies, locals }) => {
		const formData = await request.formData();
		const email = formData.get('email');
		const password = formData.get('password');
		if (!email || !password) {
			return error(422, { message: 'Bad Request', code: 'bad_request' });
		}
		const user = await loginUser(email, password);
		if (!user) {
			return error(401, { message: 'Unauthorized', code: 'unauthorized' });
		}
		const session_id = createSession(user.id);
		cookies.set('session_id', session_id, {
			path: '/',
			maxAge: SESSION_MAX_AGE
		});
		locals.session_id = session_id;
		locals.user = user;
		return {
			session_id,
			user
		};
	},
	register: async ({ request, cookies, locals }) => {
		const formData = await request.formData();
		const email = formData.get('email');
		const password = formData.get('password');
		if (!email || !password) {
			return error(422, { message: 'Bad Request', code: 'bad_request' });
		}
		const user = await createFirstUser(email, password);
		const session_id = createSession(user.id);
		cookies.set('session_id', session_id, {
			path: '/',
			maxAge: SESSION_MAX_AGE
		});
		locals.session_id = session_id;
		locals.user = user;
		return {
			session_id,
			user
		};
	}
};
