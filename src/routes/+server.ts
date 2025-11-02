import { error } from '@sveltejs/kit';
import { saveDashboard } from '$lib/server/dashboard';
import { getSessionUserInfo } from '$lib/server/session';
import { formatDataUrl, parseDataUrl } from '$lib/server/util/dataurl';
import { JSDOM } from 'jsdom';
import DomPurify from 'dompurify';
import { optimize } from 'svgo';
import type { RequestHandler } from './$types';
import type { Dashboard } from '$lib/server/dashboard';

const window = new JSDOM().window;
const purify = DomPurify(window);

export const POST: RequestHandler = async ({ request, cookies }) => {
	const session_id = cookies.get('session_id');
	if (!session_id) {
		return error(401, { message: 'unauthorized', code: 'unauthorized' });
	}
	const user = await getSessionUserInfo(session_id);
	if (!user) {
		return error(401, { message: 'unauthorized', code: 'unauthorized' });
	}
	const dashboard = (await request.json()) as Dashboard;
	sanitizeDashboard(dashboard);
	await saveDashboard(user.id, dashboard);
	return new Response(null, { status: 204 });
};

function sanitizeDashboard(dashboard: Dashboard): void {
	for (const [groupIndex, group] of dashboard.applicationGroups.entries()) {
		for (const [itemIndex, item] of group.items.entries()) {
			if (item.icon !== null) {
				const icon = processIcon(item.icon);
				dashboard.applicationGroups[groupIndex].items[itemIndex].icon = icon;
			}
		}
	}
}

const MIME_TYPES_ALLOWED = ['image/png', 'image/jpeg', 'image/svg+xml'];

function processIcon(dataUri: string): string | null {
	const result = parseDataUrl(dataUri);
	if (result === null) {
		return null;
	}

	if (!MIME_TYPES_ALLOWED.includes(result.mimeType || '')) {
		return null;
	}

	if (result.mimeType !== 'image/svg+xml') {
		return dataUri;
	}

	const sanitizedSvg = sanitizeSvg(result.body as string);
	const optimizedSvg = optimizeSvg(sanitizedSvg);
	const processedDataUri = formatDataUrl('image/svg+xml', optimizedSvg);
	return processedDataUri;
}

function sanitizeSvg(evilSvgString: string): string {
	const svgString = purify.sanitize(evilSvgString);
	return svgString;
}

function optimizeSvg(svgString: string): string {
	const svgMin = optimize(svgString);
	return svgMin.data;
}
