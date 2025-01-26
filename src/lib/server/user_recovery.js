import db from './db.js';
import { ulid } from 'ulid';
import argon2 from 'argon2';

export function createRecoveryCodes(user_id) {
	const recovery_codes = Array.from({ length: 5 }, () => ulid());
	const placeholders = recovery_codes.map(() => '(?, ?)').join(', ');
	const data = recovery_codes.flatMap((code) => [user_id, code]);
	db.exec(`INSERT INTO user_recovery_codes (user_id, code) VALUES (${placeholders})`, data);
	return recovery_codes;
}

export function verifyRecoveryCode(user_id, code) {
	const row = db.get('SELECT * FROM user_recovery_codes WHERE user_id = ? AND code = ?', [
		user_id,
		code
	]);
	if (!row) {
		return false;
	}
	db.exec('DELETE FROM user_recovery_codes WHERE user_id = ? AND code = ?', [user_id, code]);
	return true;
}
