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
	getUser,
	createUser
} from '$lib/server/user';
import {
	useRecoveryCode,
	getRecoveryCodeCount,
	createRecoveryCodes,
	getRecoveryCodes
} from '$lib/server/user_recovery';
import { getUserInvites, createInvite, getInvite, verifyInvite } from '$lib/server/user_invite';
import { getDashboard } from '$lib/server/dashboard';
import db from '$lib/server/db.js';

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
		const data = getUnauthorizedData(url.searchParams);
		return error(401, { message: 'unauthorized', ...data });
	}

	const user = getSessionUserInfo(session_id);
	if (!user) {
		const data = getUnauthorizedData(url.searchParams);
		return error(401, { message: 'unauthorized', ...data });
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

function getUnauthorizedData(searchParams) {
	if (searchParams.has('recovery_code')) {
		return {
			code: 'recovery_code',
			recovery_code: searchParams.get('recovery_code')
		};
	}

	if (searchParams.has('invite_token')) {
		const invite_token = searchParams.get('invite_token');
		const email = getInvite(invite_token);
		if (!email) {
			return {
				code: 'invite_token_validation',
				message: 'invalid invite token'
			};
		}
		return {
			code: 'invite_token',
			invite_token,
			email
		};
	}

	return {
		code: 'unauthorized'
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
	register_invite: async ({ request, cookies }) => {
		const formData = await request.formData();
		const invite_token = formData.get('invite_token');
		const password = formData.get('password');
		if (!password) {
			return error(422, {
				message: 'missing email or password',
				code: 'invite_token_validation'
			});
		}

		const email = verifyInvite(invite_token);
		if (!email) {
			return error(422, {
				message: 'invalid invite token',
				code: 'invite_token_validation'
			});
		}
		let user;
		try {
			user = await createUser(email, password);
		} catch {
			return error(422, {
				message: 'failed to register with invite token',
				code: 'invite_token_validation'
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
	invite: async ({ request, cookies }) => {
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

		createInvite(user.id, email);
		const user_invites = getUserInvites(user.id);
		return {
			user_invites
		};
	},
	db_backup: async ({ cookies }) => {
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

		const backup = db.getBackup();
		if (!backup) {
			return fail(500, {
				message: 'failed to create database backup',
				code: 'db_backup_validation'
			});
		}
		return {
			db_backup: backup.toString('base64')
		};
	}
};
