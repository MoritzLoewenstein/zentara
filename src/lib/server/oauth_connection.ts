import crypto from 'node:crypto';
import { prisma } from './db.js';

export type OAuthProvider = 'polarflow' | 'strava';

export async function setOauthState(
	user_id: string,
	provider: OAuthProvider,
	oauth_state: string
): Promise<void> {
	await prisma.oAuthConnection.upsert({
		where: {
			userId_provider: {
				userId: user_id,
				provider
			}
		},
		update: {
			oauthState: oauth_state
		},
		create: {
			userId: user_id,
			provider,
			oauthState: oauth_state
		}
	});
}

export async function verifyOauthState(
	user_id: string,
	provider: OAuthProvider,
	oauth_state_expected: string
): Promise<boolean> {
	const connection = await prisma.oAuthConnection.findUnique({
		where: {
			userId_provider: {
				userId: user_id,
				provider
			}
		},
		select: { oauthState: true }
	});

	const oauth_state = connection?.oauthState;
	if (!oauth_state || !oauth_state_expected || oauth_state.length !== oauth_state_expected.length) {
		return false;
	}

	// both state exist and are the same length, check for equality
	const oauth_state_buf = Buffer.from(oauth_state);
	const oauth_state_expected_buf = Buffer.from(oauth_state_expected);
	const oauth_state_valid = crypto.timingSafeEqual(oauth_state_buf, oauth_state_expected_buf);
	if (oauth_state_valid) {
		await prisma.oAuthConnection.update({
			where: {
				userId_provider: {
					userId: user_id,
					provider
				}
			},
			data: { oauthState: null }
		});
	}
	return oauth_state_valid;
}

export async function setAccessToken(
	user_id: string,
	provider: OAuthProvider,
	access_token: string
): Promise<void> {
	await prisma.oAuthConnection.upsert({
		where: {
			userId_provider: {
				userId: user_id,
				provider
			}
		},
		update: {
			accessToken: access_token
		},
		create: {
			userId: user_id,
			provider,
			accessToken: access_token
		}
	});
}

export async function getAccessToken(
	user_id: string,
	provider: OAuthProvider
): Promise<string | null> {
	const connection = await prisma.oAuthConnection.findUnique({
		where: {
			userId_provider: {
				userId: user_id,
				provider
			}
		},
		select: { accessToken: true }
	});

	return connection?.accessToken || null;
}

export async function getConnectionStatus(
	user_id: string,
	provider: OAuthProvider
): Promise<boolean> {
	const connection = await prisma.oAuthConnection.findUnique({
		where: {
			userId_provider: {
				userId: user_id,
				provider
			}
		},
		select: { accessToken: true }
	});

	return !!connection?.accessToken;
}

export async function deleteConnection(user_id: string, provider: OAuthProvider): Promise<void> {
	await prisma.oAuthConnection.delete({
		where: {
			userId_provider: {
				userId: user_id,
				provider
			}
		}
	});
}
