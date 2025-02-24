import Database from 'better-sqlite3';
import { building } from '$app/environment';
import seedSql from './db_seed.sql?raw';

class DB {
	constructor(dbPath) {
		const dbFile = building ? ':memory:' : dbPath;
		this.db = new Database(dbFile);
		this.db.pragma('journal_mode = WAL');
		this.db.pragma('foreign_keys = ON');
		this.db.exec(seedSql);
	}

	getAll(sql, params = []) {
		return this.db.prepare(sql).all(params);
	}

	getAllColumn(sql, params = []) {
		return this.db.prepare(sql).pluck().all(params);
	}

	get(sql, params = []) {
		return this.db.prepare(sql).get(params);
	}

	getColumn(sql, params = []) {
		return this.db.prepare(sql).pluck().get(params);
	}

	exec(sql, params = []) {
		return this.db.prepare(sql).run(params);
	}

	prepare(sql) {
		return this.db.prepare(sql);
	}

	transaction(fn) {
		return this.db.transaction(fn)();
	}
}

const instance = new DB('data/db.sqlite');
export default instance;
