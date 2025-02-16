import { ORIGIN } from '$env/dynamic/private';
import db from './db.js';
import { ulid } from 'ulid';
import { unix } from './util/unix.js';

const INVITE_TOKEN_TIMEOUT = 60 * 60 * 24 * 14; // two weeks

/** @typedef {{ token: string, email: string, valid_until: number }} UserInvite */

/**
 * @param {string} invite_token
 * @returns {string} link
 */
function inviteLink(invite_token) {
	return `${ORIGIN}/?invite_token=${invite_token}`;
}

/**
 * @export
 * @param {string} email
 * @returns {{ token: string, email: string, link: string, valid_until: number }} invite
 */
export function createInvite(user_id, email) {
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

/**
 * @export
 * @param {string} user_id
 * @returns {UserInvite[]}
 */
export function getUserInvites(user_id) {
	const unix_now = unix();
	const absoluteTimeout = unix_now - INVITE_TOKEN_TIMEOUT;
	const invites = db.getAll(
		'SELECT token, email, (created_at + ?) AS valid_until FROM user_invites WHERE user_id = ? AND created_at > ?',
		[INVITE_TOKEN_TIMEOUT, user_id, absoluteTimeout]
	);
	return invites.map((invite) => ({
		...invite,
		link: inviteLink(invite.token)
	}));
}

/**
 * @export
 * @param {string} invite_token
 * @returns {string|false} email if valid
 */
export function verifyInvite(invite_token) {
	const unix_now = unix();
	const absoluteTimeout = unix_now - INVITE_TOKEN_TIMEOUT;
	const email = db.getColumn('SELECT email FROM user_invites WHERE token = ? AND created_at > ?', [
		invite_token,
		absoluteTimeout
	]);
	if (!email) {
		return false;
	}
	db.exec('DELETE FROM user_invites WHERE id = ?', [invite_token]);
	return email;
}
