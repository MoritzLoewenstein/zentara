import { db } from '$lib/server/db';
import strava from '$lib/server/strava';
import polarflow from '$lib/server/polarflow';
import type { HandleServerError } from '@sveltejs/kit';

db.init();
strava.registerWebhook();
polarflow.registerWebhook();

export const handleError: HandleServerError = async ({ error, message }) => {
	console.error(error);
	return {
		message
	};
};
