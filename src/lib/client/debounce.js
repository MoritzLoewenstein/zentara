/**
 * Returns a function, that, as long as it continues to be invoked, will not
 * be triggered. The function will be called after the calling sequence has
 * stopped for the given wait period.
 *
 * @param {Function} func The function to debounce.
 * @param {number} wait The number of milliseconds to delay.
 * @param {boolean} immediate If `true`, trigger the function on the leading edge,
 *                            instead of the trailing.
 * @returns {Function} A debounced version of the provided function.
 */
export function debounce(func, wait, immediate = false) {
	let timeout;

	return function executedFunction(...args) {
		const later = () => {
			timeout = null;
			if (!immediate) func.apply(this, args);
		};

		const callNow = immediate && !timeout;

		clearTimeout(timeout);

		timeout = setTimeout(later, wait);

		if (callNow) func.apply(this, args);
	};
}
