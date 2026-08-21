import { prisma } from './db';
import type { UserRecord } from '../../../generated/prisma/client';
import { type JsonValue } from '@prisma/client/runtime/client';

class UserRecordClass {
	async add(userId: string, recordType: string, value: Exclude<JsonValue, null>): Promise<string> {
		const row = await prisma.userRecord.create({
			select: {
				id: true
			},
			data: {
				userId,
				recordType,
				value
			}
		});
		return row.id;
	}

	async update(userId: string, id: string, value: Exclude<JsonValue, null>): Promise<void> {
		await prisma.userRecord.update({
			select: {
				id: true
			},
			data: {
				value
			},
			where: {
				userId,
				id
			}
		});
	}

	async getSingle(userId: string, id: string): Promise<UserRecord | null> {
		const row = await prisma.userRecord.findUnique({
			where: {
				userId,
				id
			}
		});
		return row;
	}

	async getByType(userId: string, recordType: string): Promise<UserRecord[]> {
		const rows = await prisma.userRecord.findMany({
			where: {
				userId,
				recordType
			}
		});
		return rows;
	}

	async deleteSingle(userId: string, id: string): Promise<void> {
		// deleteMany: do not error if option does not exist
		await prisma.userRecord.deleteMany({
			where: {
				userId,
				id
			}
		});
	}

	async deleteByType(userId: string, recordType: string): Promise<void> {
		await prisma.userRecord.deleteMany({
			where: {
				userId,
				recordType
			}
		});
	}
}

const instance = new UserRecordClass();
export default instance;
