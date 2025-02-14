/**
 * @description data url parser according to https://www.rfc-editor.org/rfc/rfc2397
 *
 * @export
 * @param {string} dataUrlStr
 * @returns {{mimeType: string, mimeParam: {key: string, value: string}|null, encoding: string|null, body: ArrayBufferLike|string} | null}
 */
export function parseDataUrl(dataUrlStr, options = { asText: true }) {
	if (!dataUrlStr.startsWith('data:')) {
		return null;
	}

	const metaEnd = dataUrlStr.indexOf(',');
	const meta = dataUrlStr.slice(5, metaEnd);
	let body = dataUrlStr.slice(metaEnd + 1);

	const parts = meta.split(';');
	if (parts.length > 3) {
		// max parts: mimeType, mimeParam, encoding
		return null;
	}

	let mimeType = null;
	let mimeParam = null;
	let encoding = null;

	// case 1: no parts

	if (parts.length === 1) {
		// case 2: 1 part mimetype
		// case 3: 1 part encoding
		if (parts[0].includes('/')) {
			mimeType = parts[0];
		} else {
			encoding = validateEncoding(parts[0]);
		}
	} else if (parts.length === 2) {
		// case 4: 2 parts mimetype, encoding
		// case 5: 2 parts mimetype, mimeParam
		if (parts[0].includes('/')) {
			mimeType = parts[0];
			if (parts[1].includes('=')) {
				const [key, value] = parts[1].split('=');
				mimeParam = {
					key,
					value
				};
			} else {
				encoding = validateEncoding(parts[1]);
			}
		}
	} else {
		// case 6: 3 parts mimetype, mimeParam, encoding
		if (parts[0].includes('/')) {
			mimeType = parts[0];
			if (parts[1].includes('=')) {
				const [key, value] = parts[1].split('=');
				mimeParam = {
					key,
					value
				};
			}
			encoding = validateEncoding(parts[2]);
		}
	}

	if (options.asText) {
		if (encoding === 'base64') {
			body = Buffer.from(body, encoding).toString('utf8');
		} else {
			body = decodeURIComponent(body);
		}
	} else {
		body = Buffer.from(body, encoding);
	}

	return { mimeType, mimeParam, encoding, body };
}

/**
 *
 * @export
 * @param {string} mimeType
 * @param {ArrayBufferLike|string} data
 * @returns {string}
 */
export function formatDataUrl(mimeType, data) {
	const encoding = data instanceof ArrayBuffer ? 'base64' : 'utf8';
	let body;
	if (data instanceof ArrayBuffer) {
		body = Buffer.from(data).toString(encoding);
	}
	if (encoding === 'utf8') {
		body = encodeURIComponent(data);
	}

	return `data:${mimeType};${encoding},${body}`;
}

function validateEncoding(encodingStr) {
	const encoding = encodingStr.toLowerCase();
	if (encoding !== 'base64' && encoding !== 'utf8' && encoding !== 'utf-8') {
		return null;
	}
	return encoding;
}
