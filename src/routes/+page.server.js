import { error } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { USER_MAIL, USER_PASSWORD } from '$env/static/private';
import argon2 from 'argon2';
import { ulid } from 'ulid';

const SESSIONS = new Map();
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

/** @type {import('@sveltejs/kit').ServerLoad} */
export async function load({ cookies }) {
	if (dev) {
		return { user: { mail: USER_MAIL } };
	}
	const sessionCookie = cookies.get('sessionid');
	console.log(sessionCookie);
	if (!sessionCookie) {
		return error(401, { message: 'Unauthorized', code: 'unauthorized' });
	}

	if (!SESSIONS.has(sessionCookie)) {
		return error(401, { message: 'Unauthorized', code: 'unauthorized' });
	}
	const session = SESSIONS.get(sessionCookie);
	if (session.created_at + SESSION_MAX_AGE < Date.now() / 1000) {
		// session expired
		SESSIONS.delete(sessionCookie);
		return error(401, { message: 'Unauthorized', code: 'unauthorized' });
	}

	return { user: session };
}

/** @satisfies {import('./$types').Actions} */
export const actions = {
	default: async ({ request, cookies, locals }) => {
		const formData = await request.formData();
		const email = formData.get('email');
		const password = formData.get('password');
		if (email !== USER_MAIL || !password) {
			return error(401, { message: 'Unauthorized', code: 'unauthorized' });
		}
		const valid = await argon2.verify(USER_PASSWORD, password);
		if (!valid) {
			return error(401, { message: 'Unauthorized', code: 'unauthorized' });
		}

		const sessionid = ulid();
		cookies.set('sessionid', sessionid, { path: '/', maxAge: SESSION_MAX_AGE });
		locals.user = {
			sessionid,
			mail: email
		};
		SESSIONS.set(sessionid, {
			...locals.user,
			created_at: Date.now() / 1000
		});
	}
};
