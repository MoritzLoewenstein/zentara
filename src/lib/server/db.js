import Database from 'better-sqlite3';
import fs from 'node:fs';

class DB {
	constructor(dbPath) {
		this.db = new Database(dbPath);
		this.db.pragma('journal_mode = WAL');
		this.db.pragma('foreign_keys = ON');
		const seedSql = fs.readFileSync('src/lib/server/db_seed.sql', 'utf-8');
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
