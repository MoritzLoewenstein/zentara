// eslint-disable-next-line no-undef
let activeToasts = $state([]);
function createToast() {
	const toast_default_duration = 3000;
	return {
		get value() {
			return activeToasts;
		},
		add: (message) => {
			const id = Math.floor(Math.random() * 1000);
			activeToasts.push({ id, message });
			setTimeout(() => {
				activeToasts = activeToasts.filter((t) => t.id !== id);
			}, toast_default_duration);
		},
		remove: (toast_id) => {
			activeToasts = activeToasts.filter((t) => t.id !== toast_id);
		}
	};
}
export const toast = createToast();
