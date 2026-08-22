import { DbNull, type JsonValue } from '@prisma/client/runtime/client';
import { prisma } from './db';

class UserOptionClass {
	async set(userId: string, key: string, value: JsonValue): Promise<void> {
		await prisma.userOption.upsert({
			select: {
				userId: true
			},
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

	async get<T = JsonValue>(userId: string, key: string): Promise<T | null> {
		const row = await prisma.userOption.findUnique({
			select: {
				value: true
			},
			where: {
				userId_key: {
					userId,
					key
				}
			}
		});
		return (row?.value as T) || null;
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
