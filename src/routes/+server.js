import { error } from "@sveltejs/kit";
import { saveDashboard } from "$lib/server/dashboard";
import { getSessionUserInfo } from "$lib/server/session";
import { formatDataUrl, parseDataUrl } from "$lib/server/util/dataurl";
import { JSDOM } from "jsdom";
import DomPurify from "dompurify";
import { optimize } from "svgo";

const window = new JSDOM().window;
const purify = DomPurify(window);

export async function POST({ request, cookies }) {
	const session_id = cookies.get("session_id");
	if (!session_id) {
		return error(401, { message: "unauthorized", code: "unauthorized" });
	}
	const user = getSessionUserInfo(session_id);
	if (!user) {
		return error(401, { message: "unauthorized", code: "unauthorized" });
	}
	const dashboard = await request.json();
	sanitizeDashboard(dashboard);
	saveDashboard(user.id, dashboard);
	return new Response(null, { status: 204 });
}

function sanitizeDashboard(dashboard) {
	for (const [groupIndex, group] of dashboard.applicationGroups.entries()) {
		for (const [itemIndex, item] of group.items.entries()) {
			if (item.icon !== null) {
				const icon = processIcon(item.icon);
				dashboard.applicationGroups[groupIndex].items[itemIndex].icon = icon;
			}
		}
	}
}

const MIME_TYPES_ALLOWED = ["image/png", "image/jpeg", "image/svg+xml"];
function processIcon(dataUri) {
	const result = parseDataUrl(dataUri);
	if (result === null) {
		return null;
	}

	if (!MIME_TYPES_ALLOWED.includes(result.mimeType)) {
		return null;
	}

	if (result.mimeType !== "image/svg+xml") {
		return dataUri;
	}

	const sanitizedSvg = sanitizeSvg(result.body);
	const optimizedSvg = optimizeSvg(sanitizedSvg);
	const processedDataUri = formatDataUrl("image/svg+xml", optimizedSvg);
	return processedDataUri;
}

/**
 * @param {string} evilSvgString
 * @returns {string}
 */
function sanitizeSvg(evilSvgString) {
	const svgString = purify.sanitize(evilSvgString);
	return svgString;
}

/**
 * @param {string} svgString
 * @returns {string}
 */
function optimizeSvg(svgString) {
	const svgMin = optimize(svgString);
	return svgMin.data;
}
