import { prisma } from './db.js';

export interface Application {
	icon: string | null;
	name: string;
	link: string;
	movePreview?: boolean;
}

export interface ApplicationGroup {
	title: string;
	movePreview?: boolean;
	items: Application[];
}

export interface Bookmark {
	title: string;
	link: string;
	movePreview?: boolean;
}

export interface BookmarkGroup {
	title: string;
	movePreview?: boolean;
	items: Bookmark[];
}

export interface Dashboard {
	applicationGroups: ApplicationGroup[];
	bookmarkGroups: BookmarkGroup[];
}

export async function saveDashboard(user_id: string, dashboard_config: Dashboard): Promise<void> {
	const config = JSON.stringify(dashboard_config);
	await prisma.dashboard.upsert({
		where: { userId: user_id },
		update: { config },
		create: { userId: user_id, config }
	});
}

export async function getDashboard(user_id: string): Promise<Dashboard> {
	const dashboard = await prisma.dashboard.findUnique({
		where: { userId: user_id },
		select: { config: true }
	});
	if (!dashboard) {
		return DASHBOARD_DEFAULT;
	}
	return JSON.parse(dashboard.config);
}

const DASHBOARD_DEFAULT: Dashboard = {
	applicationGroups: [
		{
			title: 'Applications',
			items: [
				{
					icon: '',
					name: 'Example Application',
					link: 'https://example.com'
				}
			]
		}
	],
	bookmarkGroups: [
		{
			title: 'Bookmarks',
			items: [
				{
					title: 'Example Bookmark',
					link: 'https://example.com'
				}
			]
		}
	]
};
