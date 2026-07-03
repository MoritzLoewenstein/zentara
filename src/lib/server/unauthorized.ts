import { getInvite } from './user_invite';

export async function getUnauthorizedData(searchParams: URLSearchParams) {
	if (searchParams.has('recovery_code')) {
		return {
			code: 'recovery_code',
			recovery_code: searchParams.get('recovery_code')
		};
	}

	if (searchParams.has('invite_token')) {
		const invite_token = searchParams.get('invite_token');
		const email = await getInvite(invite_token!);
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
