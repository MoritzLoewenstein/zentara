import { DbNull, type JsonValue } from '@prisma/client/runtime/client';
import { prisma } from './db';

class OptionClass {
	async set(key: string, value: JsonValue): Promise<void> {
		await prisma.option.upsert({
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

	async get(key: string): Promise<JsonValue> {
		const row = await prisma.option.findUnique({
			where: {
				key
			}
		});
		return row?.value || null;
	}

	async delete(key: string): Promise<void> {
		await prisma.option.delete({
			where: {
				key
			}
		});
	}
}

const instance = new OptionClass();
export default instance;
