import Database from 'better-sqlite3';
import { building } from '$app/environment';
import seedSql from './db_seed.sql?raw';

class DB {
	private db: Database.Database;

	constructor(dbPath: string) {
		const dbFile = building ? ':memory:' : dbPath;
		this.db = new Database(dbFile);
		this.db.pragma('journal_mode = WAL');
		this.db.pragma('foreign_keys = ON');
		try {
			this.db.exec(seedSql);
		} catch {}
	}

	getBackup(): Buffer {
		const buffer = this.db.serialize();
		return buffer;
	}

	getAll<T = any>(sql: string, params: any[] = []): T[] {
		return this.db.prepare(sql).all(params) as T[];
	}

	getAllColumn<T = any>(sql: string, params: any[] = []): T[] {
		return this.db.prepare(sql).pluck().all(params) as T[];
	}

	get<T = any>(sql: string, params: any[] = []): T | undefined {
		return this.db.prepare(sql).get(params) as T | undefined;
	}

	getColumn<T = any>(sql: string, params: any[] = []): T | undefined {
		return this.db.prepare(sql).pluck().get(params) as T | undefined;
	}

	exec(sql: string, params: any[] = []): Database.RunResult {
		return this.db.prepare(sql).run(params);
	}

	prepare(sql: string): Database.Statement {
		return this.db.prepare(sql);
	}

	transaction<T>(fn: () => T): T {
		return this.db.transaction(fn)();
	}
}

const instance = new DB('data/db.sqlite');
export default instance;
