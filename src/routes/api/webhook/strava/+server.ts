import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import strava from '$lib/server/strava';

// Strava subscription validation: callback receives `hub.mode`, `hub.challenge`
// and `hub.verify_token` in the query string and must echo the challenge.
// https://developers.strava.com/docs/webhooks/
export const GET: RequestHandler = async ({ url }) => {
	const challenge = await strava.verifySubscriptionChallenge(url.searchParams);
	if (challenge === null) {
		return new Response(null, { status: 403 });
	}
	return json({ 'hub.challenge': challenge }, { status: 200 });
};

// Strava webhook event delivery. Must respond 200 within 2 seconds.
export const POST: RequestHandler = async ({ request }) => {
	const signature = request.headers.get('x-strava-signature');
	if (signature === null) {
		return new Response(null, { status: 404 });
	}

	const rawBody = await request.text();
	if (!strava.verifyWebhookSignature(signature, rawBody)) {
		console.warn('strava webhook: invalid signature');
		return new Response(null, { status: 401 });
	}

	// TODO: dispatch event for processing
	console.info('strava webhook: ', rawBody);
	return new Response(null, { status: 200 });
};
