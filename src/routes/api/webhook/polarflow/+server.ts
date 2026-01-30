import type { RequestHandler } from './$types';
import { createHmac } from 'node:crypto';

export const POST: RequestHandler = ({ request }) => {
	const _event = request.headers.get('polar-webhook-event');
	const _signature = request.headers.get('polar-webhook-signature');
	return new Response(null, { status: 204 });
};

function _calculateHmac(data: string, key: string): string {
	return createHmac('sha256', key).update(data).digest('hex');
}
