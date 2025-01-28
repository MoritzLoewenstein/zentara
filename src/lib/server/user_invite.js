import db from './db.js';
import { ulid } from 'ulid';

const INVITE_TOKEN_TIMEOUT = 60 * 60 * 24 * 14; // two weeks

/** @typedef {{ token: string, email: string, valid_until: number }} UserInvite */

/**
 * @export
 * @param {string} email
 * @returns {string} invite_token
 */
export function createInvite(user_id, email) {
	const invite_token = ulid();
	db.exec('INSERT INTO user_invites (user_id, token, email, created_at) VALUES (?, ?, ?, ?)', [
		user_id,
		invite_token,
		email,
		Date.now() / 1000
	]);
	return invite_token;
}

/**
 * @export
 * @param {string} user_id
 * @returns {UserInvite[]}
 */
export function getUserInvites(user_id) {
	const absoluteTimeout = Date.now() / 1000 - INVITE_TOKEN_TIMEOUT;
	return db.getAll(
		'SELECT token, email, (created_at + ?) AS valid_until FROM user_invites WHERE user_id = ? AND created_at > ?',
		[INVITE_TOKEN_TIMEOUT, user_id, absoluteTimeout]
	);
}

/**
 * @export
 * @param {string} invite_token
 * @returns {string|false} email if valid
 */
export function verifyInvite(invite_token) {
	const absoluteTimeout = Date.now() / 1000 - INVITE_TOKEN_TIMEOUT;
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
