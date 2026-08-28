import { db } from '$lib/server/db';
import strava from '$lib/server/strava';
import polarflow from '$lib/server/polarflow';
import type { HandleServerError, ServerInit } from '@sveltejs/kit';

export const init: ServerInit = async () => {
	db.init();
	// these are async functions, but we do not await them
	// because we need the http server to start for them to work
	setTimeout(() => {
		strava.init().catch((err) => console.error('strava init error:', err));
		polarflow.init().catch((err) => console.error('polarflow init error:', err));
	}, 10);
};

export const handleError: HandleServerError = async ({ error, message }) => {
	console.error(error);
	return {
		message
	};
};
