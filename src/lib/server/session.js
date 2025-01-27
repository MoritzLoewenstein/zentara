import db from './db.js';
import { ulid } from 'ulid';

const SESSION_TIMEOUT_ABSOLUTE = 60 * 60 * 24 * 14; // two weeks
const SESSION_TIMEOUT_INACTIVITY = 60 * 60 * 24; // one day

export const SESSION_MAX_AGE = SESSION_TIMEOUT_ABSOLUTE;

/**
 * @export
 * @param {string} user_id
 * @returns {string} session_id
 */
export function createSession(user_id) {
	const session_id = ulid();
	const unix = Date.now() / 1000;
	db.exec('INSERT INTO sessions (id, created_at, updated_at, user_id) VALUES (?, ?, ?, ?)', [
		session_id,
		unix,
		unix,
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
	const absoluteTimeout = Date.now() / 1000 - SESSION_TIMEOUT_ABSOLUTE;
	const inactivityTimeout = Date.now() / 1000 - SESSION_TIMEOUT_INACTIVITY;
	const user = db.get(
		`SELECT users.id AS id, users.email AS email
		FROM sessions
		LEFT JOIN users ON sessions.user_id = users.id
		WHERE sessions.id = ? AND sessions.created_at > ? AND sessions.updated_at > ?`,
		[session_id, absoluteTimeout, inactivityTimeout]
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
	db.exec('UPDATE sessions SET updated_at = ? WHERE id = ?', [Date.now() / 1000, session_id]);
}

/**
 * @export
 * @param {string} session_id
 */
export function invalidateSession(session_id) {
	// if created_at = 0, the session will be expired
	// can not delete session because we dont want to reassign the session_id to another user
	db.exec('UPDATE sessions SET created_at = 0 WHERE id = ?', [session_id]);
}

/**
 * @export
 * @param {string} user_id
 * @param {string} session_id
 */
export function invalidateOtherSessions(user_id, session_id) {
	// log out from all other devices functionality
	db.exec('UPDATE sessions SET created_at = 0 WHERE user_id = ? AND id != ?', [
		user_id,
		session_id
	]);
}
