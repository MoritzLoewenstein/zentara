import crypto from 'node:crypto';
import db from './db.js';
import { token } from './util/token.js';
import { unix } from './util/unix.js';

const SESSION_TIMEOUT_ABSOLUTE = 60 * 60 * 24 * 14;
const SESSION_TIMEOUT_INACTIVITY = 60 * 60 * 24;

export const SESSION_MAX_AGE = SESSION_TIMEOUT_ABSOLUTE;

interface SessionUserInfo {
	id: string;
	email: string;
	is_admin: boolean;
	first_login: boolean;
}

export function createSession(user_id: string): string {
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

export function getSessionUserInfo(session_id: string): SessionUserInfo | null {
	const unix_now = unix();
	const absoluteTimeout = unix_now - SESSION_TIMEOUT_ABSOLUTE;
	const inactivityTimeout = unix_now - SESSION_TIMEOUT_INACTIVITY;
	const firstLoginCutoff = unix_now - 60;
	const user = db.get<SessionUserInfo>(
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

export function setSessionOauthState(session_id: string, oauth_state: string): void {
	db.exec('UPDATE sessions SET oauth_state = ? WHERE id = ?', [oauth_state, session_id]);
}

export function verifySessionOauthState(session_id: string, oauth_state_expected: string): boolean {
	const oauth_state = db.getColumn<string>('SELECT oauth_state FROM sessions WHERE id = ?', [
		session_id
	]);
	if (!oauth_state || !oauth_state_expected) {
		return false;
	}
	if (oauth_state.length !== oauth_state_expected.length) {
		return false;
	}
	const oauth_state_buf = Buffer.from(oauth_state);
	const oauth_state_expected_buf = Buffer.from(oauth_state_expected);
	const oauth_state_valid = crypto.timingSafeEqual(oauth_state_buf, oauth_state_expected_buf);
	if (oauth_state_valid) {
		db.exec('UPDATE sessions SET oauth_state = NULL WHERE id = ?', [session_id]);
	}
	return oauth_state_valid;
}

export function updateSession(session_id: string): void {
	const unix_now = unix();
	db.exec('UPDATE sessions SET updated_at = ? WHERE id = ?', [unix_now, session_id]);
}

export function invalidateSession(session_id: string): void {
	db.exec('DELETE FROM sessions WHERE id = ?', [session_id]);
}

export function invalidateOtherSessions(user_id: string, session_id: string): void {
	db.exec('DELETE FROM sessions WHERE user_id = ? AND id != ?', [user_id, session_id]);
}
