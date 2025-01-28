import db from './db.js';
import { token } from './util/token.js';
import { unix } from './util/unix.js';

const SESSION_TIMEOUT_ABSOLUTE = 60 * 60 * 24 * 14; // two weeks
const SESSION_TIMEOUT_INACTIVITY = 60 * 60 * 24; // one day

export const SESSION_MAX_AGE = SESSION_TIMEOUT_ABSOLUTE;

/**
 * @export
 * @param {string} user_id
 * @returns {string} session_id
 */
export function createSession(user_id) {
	const session_id = token();
	const unix_now = unix();
	db.exec('INSERT INTO sessions (id, created_at, updated_at, user_id) VALUES (?, ?, ?, ?)', [
		session_id,
		unix_now,
		unix_now,
		user_id
	]);
	return session_id;
}

/**
 * @export
 * @param {string} session_id
 * @returns {{id: string, email: string}|null}
 */
export function getSessionUserInfo(session_id) {
	const unix_now = unix();
	const absoluteTimeout = unix_now - SESSION_TIMEOUT_ABSOLUTE;
	const inactivityTimeout = unix_now - SESSION_TIMEOUT_INACTIVITY;
	const firstLoginCutoff = unix_now - 60; // 1 minute
	const user = db.get(
		`SELECT users.id AS id, users.email AS email, users.is_admin AS is_admin, (users.created_at > ?) AS first_login
		FROM sessions
		LEFT JOIN users ON sessions.user_id = users.id
		WHERE sessions.id = ? AND sessions.created_at > ? AND sessions.updated_at > ?`,
		[firstLoginCutoff, session_id, absoluteTimeout, inactivityTimeout]
	);
	if (!user) {
		return null;
	}
	return user;
}

/**
 * @export
 * @param {string} session_id
 */
export function updateSession(session_id) {
	const unix_now = unix();
	db.exec('UPDATE sessions SET updated_at = ? WHERE id = ?', [unix_now, session_id]);
}

/**
 * @export
 * @param {string} session_id
 */
export function invalidateSession(session_id) {
	db.exec('DELETE FROM sessions WHERE id = ?', [session_id]);
}

/**
 * @export
 * @param {string} user_id
 * @param {string} session_id
 */
export function invalidateOtherSessions(user_id, session_id) {
	db.exec('DELETE FROM sessions WHERE user_id = ? AND id != ?', [user_id, session_id]);
}
