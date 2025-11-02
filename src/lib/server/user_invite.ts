import { env } from '$env/dynamic/private';
import db from './db.js';
import { ulid } from 'ulid';
import { unix } from './util/unix.js';

const INVITE_TOKEN_TIMEOUT = 60 * 60 * 24 * 14;

export interface UserInvite {
	token: string;
	email: string;
	link: string;
	valid_until: number;
}

function inviteLink(invite_token: string): string {
	return `${env.ORIGIN}/?invite_token=${invite_token}`;
}

export function createInvite(user_id: string, email: string): UserInvite {
	const invite_token = ulid();
	const unix_now = unix();
	const valid_until = unix_now + INVITE_TOKEN_TIMEOUT;
	db.exec('INSERT INTO user_invites (user_id, token, email, created_at) VALUES (?, ?, ?, ?)', [
		user_id,
		invite_token,
		email,
		unix_now
	]);
	return {
		token: invite_token,
		link: inviteLink(invite_token),
		email,
		valid_until
	};
}

export function getUserInvites(user_id: string): UserInvite[] {
	const unix_now = unix();
	const absoluteTimeout = unix_now - INVITE_TOKEN_TIMEOUT;
	const invites = db.getAll<{ token: string; email: string; valid_until: number }>(
		'SELECT token, email, (created_at + ?) AS valid_until FROM user_invites WHERE user_id = ? AND created_at > ?',
		[INVITE_TOKEN_TIMEOUT, user_id, absoluteTimeout]
	);
	return invites.map((invite) => ({
		...invite,
		link: inviteLink(invite.token)
	}));
}

export function getInvite(invite_token: string): string | false {
	const unix_now = unix();
	const absoluteTimeout = unix_now - INVITE_TOKEN_TIMEOUT;
	const email = db.getColumn<string>(
		'SELECT email FROM user_invites WHERE token = ? AND created_at > ?',
		[invite_token, absoluteTimeout]
	);
	if (!email) {
		return false;
	}
	return email;
}

export function verifyInvite(invite_token: string): string | false {
	const unix_now = unix();
	const absoluteTimeout = unix_now - INVITE_TOKEN_TIMEOUT;
	const email = db.getColumn<string>(
		'SELECT email FROM user_invites WHERE token = ? AND created_at > ?',
		[invite_token, absoluteTimeout]
	);
	if (!email) {
		return false;
	}
	db.exec('DELETE FROM user_invites WHERE token = ?', [invite_token]);
	return email;
}
