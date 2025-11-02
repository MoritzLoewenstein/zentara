import { ulid } from 'ulid';
import argon2 from 'argon2';
import db from './db.js';
import { unix } from './util/unix.js';

export interface User {
	id: string;
	email: string;
	is_admin?: boolean;
}

interface UserWithFirstLogin extends User {
	first_login: boolean;
}

export function isFirstUser(): boolean {
	const user_count = db.getColumn<number>('SELECT count(*) FROM users');
	return user_count === 0;
}

export async function createFirstUser(email: string, password: string): Promise<User> {
	const insertUser = db.prepare(
		'INSERT INTO users (id, email, password, created_at, is_admin) VALUES (?, ?, ?, ?, 1)'
	);
	const user_id = ulid();
	const hashed_password = await argon2.hash(password);
	const unix_now = unix();
	db.transaction(() => {
		const user_count = db.getColumn<number>('SELECT count(*) FROM users');
		if (user_count !== 0) {
			throw new Error('First user already exists');
		}
		insertUser.run(user_id, email, hashed_password, unix_now);
	});
	return {
		id: user_id,
		email,
		is_admin: true
	};
}

export async function createUser(email: string, password: string): Promise<User> {
	const user_id = ulid();
	const hashed_password = await argon2.hash(password);
	const unix_now = unix();
	db.exec('INSERT INTO users (id, email, password, created_at) VALUES (?, ?, ?, ?)', [
		user_id,
		email,
		hashed_password,
		unix_now
	]);
	return {
		id: user_id,
		email
	};
}

export function getUser(user_id: string): User | undefined {
	return db.get<User>('SELECT id, email, is_admin FROM users WHERE id = ?', [user_id]);
}

export async function updateUserPassword(user_id: string, password: string): Promise<void> {
	const hashed_password = await argon2.hash(password);
	db.exec('UPDATE users SET password = ? WHERE id = ?', [hashed_password, user_id]);
}

export async function loginUser(
	email: string,
	password: string
): Promise<UserWithFirstLogin | false> {
	const unix_now = unix();
	const firstLoginCutoff = unix_now - 60;
	const user = db.get<any>(
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
