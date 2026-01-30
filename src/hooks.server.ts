import { db } from '$lib/server/db';
import type { HandleServerError } from '@sveltejs/kit';

db.init();

export const handleError: HandleServerError = async ({ error, message }) => {
	console.error(error);
	return {
		message
	};
};
