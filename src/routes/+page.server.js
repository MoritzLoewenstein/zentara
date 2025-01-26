import { error } from "@sveltejs/kit";
import {
	createSession,
	getSession,
	updateSession,
	SESSION_MAX_AGE,
} from "$lib/server/session";
import {
	isFirstUser,
	loginUser,
	createFirstUser,
	createUser,
} from "$lib/server/user";

/** @type {import('@sveltejs/kit').ServerLoad} */
export async function load({ cookies }) {
	const firstUser = isFirstUser();
	if (firstUser) {
		return error(401, {
			message: "Unauthorized",
			code: "unauthorized_first_user",
		});
	}
	const sessionCookie = cookies.get("session_id");
	if (!sessionCookie) {
		return error(401, { message: "Unauthorized", code: "unauthorized" });
	}

	const session = getSession(sessionCookie);
	if (!session) {
		return error(401, { message: "Unauthorized", code: "unauthorized" });
	}
	updateSession(sessionCookie);
	return { user: session };
}

/** @satisfies {import('./$types').Actions} */
export const actions = {
	login: async ({ request, cookies, locals }) => {
		const formData = await request.formData();
		const email = formData.get("email");
		const password = formData.get("password");
		if (!email || !password) {
			return error(422, { message: "Bad Request", code: "bad_request" });
		}
		const user = await loginUser(email, password);
		if (!user) {
			return error(401, { message: "Unauthorized", code: "unauthorized" });
		}
		const session_id = createSession(email);
		cookies.set("session_id", session_id, {
			path: "/",
			maxAge: SESSION_MAX_AGE,
		});
		locals.user = {
			session_id,
			...user,
		};
	},
	register: async ({ request, cookies, locals }) => {
		const formData = await request.formData();
		const email = formData.get("email");
		const password = formData.get("password");
		if (!email || !password) {
			return error(422, { message: "Bad Request", code: "bad_request" });
		}
		const user = createFirstUser(email, password);
		const session_id = createSession(user.id);
		cookies.set("session_id", session_id, {
			path: "/",
			maxAge: SESSION_MAX_AGE,
		});
		locals.user = {
			session_id,
			...user,
		};
	},
};
