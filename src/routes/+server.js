import { error } from '@sveltejs/kit';
import { saveDashboard } from '$lib/server/dashboard';
import { getSessionUserInfo } from '$lib/server/session';

export async function POST({ request, cookies }) {
	const session_id = cookies.get('session_id');
	if (!session_id) {
		return error(401, { message: 'unauthorized', code: 'unauthorized' });
	}
	const user = getSessionUserInfo(session_id);
	if (!user) {
		return error(401, { message: 'unauthorized', code: 'unauthorized' });
	}
	const dashboard = await request.json();
	saveDashboard(user.id, dashboard);
	return new Response(null, { status: 204 });
}
