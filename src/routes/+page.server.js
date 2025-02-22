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
import { getUserInvites, createInvite } from '$lib/server/user_invite';
import { getDashboard } from '$lib/server/dashboard';

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
	return {
		session_id,
		user,
		dashboard: getDashboard(user.id),
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
			dashboard: getDashboard(user.id),
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
			session_id,
			user,
			dashboard: getDashboard(user.id),
			recovery_code_count: getRecoveryCodeCount(user.id),
			user_invites: getUserInvites(user.id),
			first_login: true,
			recovery_codes
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
			dashboard: getDashboard(user.id),
			recovery_code_count: getRecoveryCodeCount(user_id),
			user_invites: getUserInvites(user_id)
		};
	},
	recovery_codes: async ({ request, cookies }) => {
		const session_id = cookies.get('session_id');
		if (!session_id) {
			return error(401, { message: 'unauthorized', code: 'unauthorized' });
		}

		const user = getSessionUserInfo(session_id);
		if (!user) {
			return error(401, { message: 'unauthorized', code: 'unauthorized' });
		}

		const formData = await request.formData();
		const password = formData.get('password');
		if (!password) {
			return fail(422, {
				message: 'missing password',
				code: 'recovery_codes_validation'
			});
		}

		const result = await loginUser(user.email, password);
		if (!result) {
			return fail(422, {
				message: 'invalid password',
				code: 'recovery_codes_validation'
			});
		}

		const recovery_codes = createRecoveryCodes(user.id);
		return {
			recovery_codes,
			recovery_code_count: recovery_codes.length
		};
	},
	invite_create: async ({ request, cookies }) => {
		const session_id = cookies.get('session_id');
		if (!session_id) {
			return error(401, { message: 'unauthorized', code: 'unauthorized' });
		}

		const user = getSessionUserInfo(session_id);
		if (!user) {
			return error(401, { message: 'unauthorized', code: 'unauthorized' });
		}

		if (!user.is_admin) {
			return fail(403, {
				message: 'unauthorized',
				code: 'unauthorized'
			});
		}

		const formData = await request.formData();
		const email = formData.get('email');
		if (!email) {
			return fail(422, {
				message: 'missing email',
				code: 'invite_validation'
			});
		}

		const invite = createInvite(user.id, email);
		return {
			success: true,
			invite
		};
	}
};
