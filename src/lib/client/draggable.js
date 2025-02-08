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
 * @return {number} - The index in the container at which to insert the dragged item
 */
export function getInsertIndex(container, clientY) {
	const items = Array.from(container.children).filter(
		(el) => !el.classList.contains('movePreview')
	);

	for (let i = 0; i < items.length; i++) {
		const rect = items[i].getBoundingClientRect();
		// Consider the vertical midpoint of each item
		const midpoint = rect.top + rect.height / 2;

		// If pointer is above this item’s midpoint, insert at this index
		if (clientY < midpoint) {
			return i;
		}
	}

	// hide drop preview if currently dragging over margin between items
	return null;
}
