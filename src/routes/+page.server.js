import { error, fail } from '@sveltejs/kit';
import {
	createSession,
	getSessionUserInfo,
	updateSession,
	SESSION_MAX_AGE
} from '$lib/server/session';
import {
	isFirstUser,
	loginUser,
	createFirstUser,
	updateUserPassword,
	getUser
} from '$lib/server/user';
import {
	useRecoveryCode,
	getRecoveryCodeCount,
	createRecoveryCodes,
	getRecoveryCodes
} from '$lib/server/user_recovery';
import { getUserInvites } from '$lib/server/user_invite';

/** @type {import('@sveltejs/kit').ServerLoad} */
export function load({ cookies, url }) {
	const firstUser = isFirstUser();
	if (firstUser) {
		return error(401, {
			message: 'unauthorized',
			code: 'register'
		});
	}
	const session_id = cookies.get('session_id');
	if (!session_id) {
		const code = url.searchParams.has('recovery_code') ? 'recovery_code' : 'unauthorized';
		return error(401, { message: 'unauthorized', code });
	}

	const user = getSessionUserInfo(session_id);
	if (!user) {
		return error(401, { message: 'unauthorized', code: 'unauthorized' });
	}
	updateSession(session_id);
	user.first_login = true;
	return {
		session_id,
		user,
		recovery_code_count: getRecoveryCodeCount(user.id),
		user_invites: getUserInvites(user.id),
		first_login: user.first_login,
		recovery_codes: user.first_login ? getRecoveryCodes(user.id) : []
	};
}

/** @satisfies {import('./$types').Actions} */
export const actions = {
	login: async ({ request, cookies }) => {
		const formData = await request.formData();
		const email = formData.get('email');
		const password = formData.get('password');
		if (!email || !password) {
			return fail(422, {
				message: 'missing email or password',
				code: 'unauthorized_validation'
			});
		}
		const user = await loginUser(email, password);
		if (!user) {
			return error(422, {
				message: 'invalid login',
				code: 'unauthorized_validation'
			});
		}
		const session_id = createSession(user.id);
		cookies.set('session_id', session_id, {
			path: '/',
			maxAge: SESSION_MAX_AGE
		});
		return {
			session_id,
			user,
			recovery_code_count: getRecoveryCodeCount(user.id),
			user_invites: getUserInvites(user.id)
		};
	},
	register: async ({ request, cookies }) => {
		const formData = await request.formData();
		const email = formData.get('email');
		const password = formData.get('password');
		if (!email || !password) {
			return error(422, {
				message: 'missing email or password',
				code: 'register_validation'
			});
		}
		let user;
		try {
			user = await createFirstUser(email, password);
		} catch {
			return error(422, {
				message: 'invalid action',
				code: 'register_validation'
			});
		}
		const recovery_codes = createRecoveryCodes(user.id);
		const session_id = createSession(user.id);
		cookies.set('session_id', session_id, {
			path: '/',
			maxAge: SESSION_MAX_AGE
		});
		return {
			first_login: true,
			session_id,
			user,
			recovery_codes,
			recovery_code_count: getRecoveryCodeCount(user.id),
			user_invites: getUserInvites(user.id)
		};
	},
	recovery_code: async ({ request, cookies }) => {
		const formData = await request.formData();
		const recovery_code = formData.get('recovery_code');
		const password = formData.get('password');
		if (!recovery_code || !password) {
			return fail(422, {
				message: 'missing recovery_code or password',
				code: 'recovery_code_validation'
			});
		}

		const user_id = useRecoveryCode(recovery_code);
		if (!user_id) {
			return fail(422, {
				message: 'invalid recovery code',
				code: 'recovery_code_validation'
			});
		}

		await updateUserPassword(user_id, password);
		const user = getUser(user_id);
		const session_id = createSession(user_id);
		cookies.set('session_id', session_id, {
			path: '/',
			maxAge: SESSION_MAX_AGE
		});
		return {
			session_id,
			user,
			recovery_code_count: getRecoveryCodeCount(user_id),
			user_invites: getUserInvites(user_id)
		};
	}
};
