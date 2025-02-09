// https://stackoverflow.com/a/6877405
// x- prefix because not registered with IANA
// zentara namespace to avoid conflicts
// +json suffix to indicate serialization format
export const MIME_TYPES = {
	APPLICATION_GROUP: 'application/x-zentara.application_group+json',
	APPLICATION: 'application/x-zentara.application+json',
	BOOKMARK_GROUP: 'application/x-zentara.bookmark_group+json',
	BOOKMARK: 'application/x-zentara.bookmark+json'
};

/**
 * Given a container element and a clientY (pointer y-coordinate from the drag event),
 * determines the correct index at which the dragged item should be inserted.
 *
 * @param {HTMLElement} container - The container holding the vertical list of items
 * @param {number} clientY - The pointer's current Y coordinate (from e.clientY in the drag event)
 * @return {number | null} - The index in the container at which to insert the dragged item
 */
export function getInsertIndex(container, clientY) {
	const items = Array.from(container.children).filter(
		(el) => !el.classList.contains('movePreview')
	);

	for (let i = 0; i < items.length; i++) {
		const rect = items[i].getBoundingClientRect();
		const midpoint = rect.top + rect.height / 2;

		if (clientY < midpoint) {
			return i;
		}
	}

	return null;
}

/**
 * Given a container element and an (x, y) coordinate (typically from a dragover event),
 * determines the index of the closest child element within the container.
 *
 * @param {HTMLElement} container - The container element holding the list of items.
 * @param {number} clientX - The pointer's current X coordinate (from e.clientY in the drag event)
 * @param {number} clientY - The pointer's current Y coordinate (from e.clientY in the drag event)
 * @returns {number | null} - The index of the closest child element, or null if the container is empty or an error occurs.
 */
export function getClosestItemIndex(container, clientX, clientY) {
	const items = Array.from(container.children).filter(
		(el) => !el.classList.contains('movePreview')
	);

	let closestIndex = null;
	let minDistance = Number.POSITIVE_INFINITY;
	for (let i = 0; i < items.length; i++) {
		const item = items[i];
		const rect = item.getBoundingClientRect();
		const centerX = rect.left + rect.width / 2;
		const centerY = rect.top + rect.height / 2;
		const distance = Math.sqrt((clientX - centerX) ** 2 + (clientY - centerY) ** 2);

		if (distance < minDistance) {
			minDistance = distance;
			closestIndex = i;
		}
	}

	return closestIndex;
}
