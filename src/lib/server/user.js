import db from './db.js';
import { ulid } from 'ulid';
import argon2 from 'argon2';

/** @typedef {{ id: string, email: string, is_admin: boolean}} User */

/**
 * @export
 * @returns {boolean}
 */
export function isFirstUser() {
	const user_count = db.getColumn('SELECT count(*) FROM users');
	return user_count === 0;
}

/**
 * Safely create first user as adnin in transaction
 *
 * @export
 * @param {string} email
 * @param {string} password
 * @returns {User}
 */
export async function createFirstUser(email, password) {
	const insertUser = db.prepare(
		'INSERT INTO users (id, email, password, created_at, is_admin) VALUES (?, ?, ?, ?, 1)'
	);
	const user_id = ulid();
	const hashed_password = await argon2.hash(password);
	const unix = Date.now() / 1000;
	db.transaction(() => {
		const user_count = db.getColumn('SELECT count(*) FROM users');
		if (user_count !== 0) {
			throw new Error('First user already exists');
		}
		insertUser.run(user_id, email, hashed_password, unix);
	});
	return {
		id: user_id,
		email,
		is_admin: true
	};
}

/**
 * @export
 * @param {string} email
 * @param {string} password
 * @returns {string} user_id
 */
export async function createUser(email, password) {
	const user_id = ulid();
	const hashed_password = await argon2.hash(password);
	const unix = Date.now() / 1000;
	db.exec('INSERT INTO users (id, email, password, created_at) VALUES (?, ?, ?, ?)', [
		user_id,
		email,
		hashed_password,
		unix
	]);
	return {
		id: user_id,
		email
	};
}

/**
 * Description placeholder
 *
 * @export
 * @param {string} user_id
 * @returns {User|undefined}
 */
export function getUser(user_id) {
	return db.get('SELECT id, email, is_admin FROM users WHERE id = ?', [user_id]);
}

/**
 * @export
 * @async
 * @param {string} user_id
 * @param {string} password
 */
export async function updateUserPassword(user_id, password) {
	const hashed_password = await argon2.hash(password);
	db.exec('UPDATE users SET password = ? WHERE id = ?', [hashed_password, user_id]);
}

/**
 * @export
 * @async
 * @param {string} email
 * @param {string} password
 * @returns {User|false}
 */
export async function loginUser(email, password) {
	const firstLoginCutoff = Date.now() / 1000 - 60; // 1 minute
	const user = db.get(
		'SELECT *, (users.created_at > ?) AS first_login FROM users WHERE email = ?',
		[firstLoginCutoff, email]
	);
	if (!user) {
		return false;
	}
	const valid = await argon2.verify(user.password, password);
	if (!valid) {
		return false;
	}
	return {
		id: user.id,
		email: user.email,
		is_admin: user.is_admin,
		first_login: user.first_login
	};
}
