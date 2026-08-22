import { DbNull, type JsonValue } from '@prisma/client/runtime/client';
import { prisma } from './db';

class OptionClass {
	async set(key: string, value: JsonValue): Promise<void> {
		await prisma.option.upsert({
			select: {
				key: true
			},
			create: {
				key,
				value: value === null ? DbNull : value
			},
			update: {
				value: value === null ? DbNull : value
			},
			where: {
				key
			}
		});
	}

	async get<T = JsonValue>(key: string): Promise<T | null> {
		const row = await prisma.option.findUnique({
			select: {
				value: true
			},
			where: {
				key
			}
		});
		return (row?.value as T) || null;
	}

	async getOrInsert<T = JsonValue>(key: string, value: JsonValue): Promise<T | null> {
		const row = await prisma.option.upsert({
			select: {
				value: true
			},
			where: { key },
			update: {},
			create: {
				key,
				value: value === null ? DbNull : value
			}
		});
		return (row?.value as T) || null;
	}

	async delete(key: string): Promise<void> {
		// deleteMany: do not error if option does not exist
		await prisma.option.deleteMany({
			where: {
				key
			}
		});
	}
}

const instance = new OptionClass();
export default instance;
