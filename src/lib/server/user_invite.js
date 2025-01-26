import db from './db.js';
import { ulid } from 'ulid';

/**
 * @export
 * @param {string} email
 * @returns {string} invite_id
 */
export function createInvite(email) {
	const invite_id = ulid();
	db.exec('INSERT INTO user_invites (id, email) VALUES (?, ?)', [invite_id, email]);
	return invite_id;
}

/**
 * @export
 * @param {string} invite_id
 * @returns {string|false} email if valid
 */
export function verifyInvite(invite_id) {
	const row = db.get('SELECT * FROM user_invites WHERE id = ?', [invite_id]);
	if (!row) {
		return false;
	}
	db.exec('DELETE FROM user_invites WHERE id = ?', [invite_id]);
	return row.email;
}
