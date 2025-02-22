import db from './db.js';
import { token } from './util/token.js';

/**
 * @export
 * @param {string} user_id
 * @returns {string[]}
 */
export function createRecoveryCodes(user_id) {
	db.exec('DELETE FROM user_recovery_codes WHERE user_id = ?', [user_id]);
	const recovery_codes = Array.from({ length: 5 }, () => token());
	const placeholders = recovery_codes.map(() => '(?, ?)').join(', ');
	const data = recovery_codes.flatMap((code) => [user_id, code]);
	db.exec(`INSERT INTO user_recovery_codes (user_id, code) VALUES ${placeholders}`, data);
	return recovery_codes;
}

/**
 * @export
 * @param {string} user_id
 * @returns {string[]}
 */
export function getRecoveryCodes(user_id) {
	return db.getAllColumn('SELECT code FROM user_recovery_codes WHERE user_id = ?', [user_id]);
}

/**
 * @export
 * @param {string} user_id
 * @returns {number}
 */
export function getRecoveryCodeCount(user_id) {
	return db.getColumn('SELECT COUNT(*) FROM user_recovery_codes WHERE user_id = ?', [user_id]);
}

/**
 * @export
 * @param {string} code
 * @returns {string|false} user_id
 */
export function useRecoveryCode(code) {
	const user_id = db.getColumn('SELECT user_id FROM user_recovery_codes WHERE code = ?', [code]);
	if (!user_id) {
		return false;
	}
	db.exec('DELETE FROM user_recovery_codes WHERE code = ?', [code]);
	return user_id;
}
