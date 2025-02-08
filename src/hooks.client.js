/** @type {import('@sveltejs/kit').HandleClientError} */
export async function handleError({ error, message }) {
	console.error(error);
	return {
		message
	};
}
