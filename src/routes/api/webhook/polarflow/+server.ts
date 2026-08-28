import type { RequestHandler } from './$types';
import polarflow from '$lib/server/polarflow';

// Polar AccessLink webhook delivery.
// PING is sent at registration / activation and must respond 200.
// https://www.polar.com/accesslink-api/#webhooks
export const POST: RequestHandler = async ({ request }) => {
	const event = request.headers.get('polar-webhook-event');

	// PING is sent during webhook (re-)registration / activation. The signing
	// secret is only returned in the create response, so on first registration
	// we cannot yet verify the PING signature — accept it unconditionally.
	if (event === 'PING') {
		return new Response(null, { status: 200 });
	}

	const signature = request.headers.get('polar-webhook-signature');
	if (event === null || signature === null) {
		return new Response(null, { status: 404 });
	}

	const rawBody = await request.text();
	const signatureValid = await polarflow.verifyWebhookSignature(signature, rawBody);
	if (!signatureValid) {
		console.warn('polarflow webhook: invalid signature', { event });
		return new Response(null, { status: 401 });
	}

	// TODO: dispatch event for processing
	console.info('polarflow webhook: ', event, rawBody);
	return new Response(null, { status: 200 });
};
