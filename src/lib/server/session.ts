import crypto from 'node:crypto';
import { prisma } from './db.js';
import { token } from './util/token.js';

const SESSION_TIMEOUT_ABSOLUTE = 60 * 60 * 24 * 14;
const SESSION_TIMEOUT_INACTIVITY = 60 * 60 * 24;

export const SESSION_MAX_AGE = SESSION_TIMEOUT_ABSOLUTE;

interface SessionUserInfo {
	id: string;
	email: string;
	is_admin: boolean;
	first_login: boolean;
}

export async function createSession(user_id: string): Promise<string> {
	const session_id = token();
	await prisma.session.create({
		data: {
			id: session_id,
			userId: user_id
		}
	});
	return session_id;
}

export async function getSessionUserInfo(session_id: string): Promise<SessionUserInfo | null> {
	const now = new Date();
	const absoluteTimeout = new Date(now.getTime() - SESSION_TIMEOUT_ABSOLUTE * 1000);
	const inactivityTimeout = new Date(now.getTime() - SESSION_TIMEOUT_INACTIVITY * 1000);
	const firstLoginCutoff = new Date(now.getTime() - 60 * 1000);

	const session = await prisma.session.findUnique({
		where: { id: session_id },
		include: { user: true }
	});

	if (
		!session ||
		session.createdAt <= absoluteTimeout ||
		session.updatedAt <= inactivityTimeout ||
		!session.user
	) {
		return null;
	}

	return {
		id: session.user.id,
		email: session.user.email,
		is_admin: session.user.isAdmin,
		first_login: session.user.createdAt > firstLoginCutoff
	};
}

export async function setSessionOauthState(session_id: string, oauth_state: string): Promise<void> {
	await prisma.session.update({
		where: { id: session_id },
		data: { oauthState: oauth_state }
	});
}

export async function verifySessionOauthState(
	session_id: string,
	oauth_state_expected: string
): Promise<boolean> {
	const session = await prisma.session.findUnique({
		where: { id: session_id },
		select: { oauthState: true }
	});

	const oauth_state = session?.oauthState;
	if (!oauth_state || !oauth_state_expected) {
		return false;
	}
	if (oauth_state.length !== oauth_state_expected.length) {
		return false;
	}
	const oauth_state_buf = Buffer.from(oauth_state);
	const oauth_state_expected_buf = Buffer.from(oauth_state_expected);
	const oauth_state_valid = crypto.timingSafeEqual(oauth_state_buf, oauth_state_expected_buf);
	if (oauth_state_valid) {
		await prisma.session.update({
			where: { id: session_id },
			data: { oauthState: null }
		});
	}
	return oauth_state_valid;
}

export async function updateSession(session_id: string): Promise<void> {
	await prisma.session.update({
		where: { id: session_id },
		data: { updatedAt: new Date() }
	});
}

export async function invalidateSession(session_id: string): Promise<void> {
	await prisma.session.delete({
		where: { id: session_id }
	});
}

export async function invalidateOtherSessions(user_id: string, session_id: string): Promise<void> {
	await prisma.session.deleteMany({
		where: {
			userId: user_id,
			id: { not: session_id }
		}
	});
}
