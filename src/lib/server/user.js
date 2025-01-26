import db from './db.js';
import { ulid } from 'ulid';
import argon2 from 'argon2';

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
 * @returns {{ id: string, email: string, is_admin: true }}
 */
export async function createFirstUser(email, password) {
	const insertUser = db.prepare(
		'INSERT INTO users (id, email, password, is_admin) VALUES (?, ?, ?, 1)'
	);
	const user_id = ulid();
	const hashed_password = await argon2.hash(password);
	db.transaction(() => {
		const user_count = db.getColumn('SELECT count(*) FROM users');
		if (user_count !== 0) {
			throw new Error('First user already exists');
		}
		insertUser.run(user_id, email, hashed_password);
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
	db.exec('INSERT INTO users (id, email, password) VALUES (?, ?, ?)', [
		user_id,
		email,
		hashed_password
	]);
	return {
		id: user_id,
		email
	};
}

/**
 * @export
 * @async
 * @param {string} email
 * @param {string} password
 * @returns {{id: string, email: string}|false}
 */
export async function loginUser(email, password) {
	const user = db.get('SELECT * FROM users WHERE email = ?', [email]);
	if (!user) {
		return false;
	}
	const valid = await argon2.verify(user.password, password);
	if (!valid) {
		return false;
	}
	return {
		id: user.id,
		email: user.email
	};
}
