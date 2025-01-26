import { redirect } from "@sveltejs/kit";
import { invalidateSession } from "$lib/server/session";

/** @type {import('./$types').RequestHandler} */
export async function GET({ cookies }) {
	const session_id = cookies.get("session_id");
	if (!session_id) {
		return redirect(303, "/");
	}

	invalidateSession(session_id);
	cookies.delete("session_id", { path: "/" });
	return redirect(303, "/");
}
