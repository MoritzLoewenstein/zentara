import { DbNull, type JsonValue } from '@prisma/client/runtime/client';
import { prisma } from './db';

class UserOptionClass {
	async set(userId: string, key: string, value: JsonValue): Promise<void> {
		await prisma.userOption.upsert({
			create: {
				userId,
				key,
				value: value === null ? DbNull : value
			},
			update: {
				value: value === null ? DbNull : value
			},
			where: {
				userId_key: {
					userId,
					key
				}
			}
		});
	}

	async get(userId: string, key: string): Promise<JsonValue> {
		const row = await prisma.userOption.findUnique({
			where: {
				userId_key: {
					userId,
					key
				}
			}
		});
		return row?.value || null;
	}

	async delete(userId: string, key: string): Promise<void> {
		// deleteMany: do not error if option does not exist
		await prisma.userOption.deleteMany({
			where: {
				userId,
				key
			}
		});
	}
}

const instance = new UserOptionClass();
export default instance;
