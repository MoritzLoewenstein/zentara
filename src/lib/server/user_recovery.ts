import db from './db.js';
import { token } from './util/token.js';
import argon2 from 'argon2';

export async function createRecoveryCodes(user_id: string): Promise<string[]> {
	db.exec('DELETE FROM user_recovery_codes WHERE user_id = ?', [user_id]);
	const recovery_codes = Array.from({ length: 5 }, () => token());
	const recovery_codes_hash = await Promise.all(recovery_codes.map((code) => argon2.hash(code)));
	const placeholders = recovery_codes.map(() => '(?, ?)').join(', ');
	const data = recovery_codes_hash.flatMap((code) => [user_id, code]);
	db.exec(`INSERT INTO user_recovery_codes (user_id, code) VALUES ${placeholders}`, data);
	return recovery_codes;
}

export function getRecoveryCodeCount(user_id: string): number {
	return (
		db.getColumn<number>('SELECT COUNT(*) FROM user_recovery_codes WHERE user_id = ?', [user_id]) ||
		0
	);
}

export async function useRecoveryCode(email: string, code: string): Promise<string | false> {
	const recovery_codes = db.getAll<{ user_id: string; code: string }>(
		`SELECT user_id, code
		FROM user_recovery_codes
		LEFT JOIN users ON users.id = user_recovery_codes.user_id
		WHERE users.email = ?`,
		[email]
	);
	for (const { user_id, code: hashed_code } of recovery_codes) {
		const valid = await argon2.verify(hashed_code, code);
		if (valid) {
			db.exec('DELETE FROM user_recovery_codes WHERE user_id = ? AND code = ?', [
				user_id,
				hashed_code
			]);
			return user_id;
		}
	}
	return false;
}
