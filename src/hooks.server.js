/** @type {import('@sveltejs/kit').HandleServerError} */
export async function handleError({ error, message }) {
	console.error(error);
	return {
		message
	};
}
