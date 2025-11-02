import db from './db.js';

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

export function saveDashboard(user_id: string, dashboard_config: Dashboard): void {
	const config = JSON.stringify(dashboard_config);
	db.exec(
		'INSERT INTO dashboards (user_id, config) VALUES (?, ?) ON CONFLICT (user_id) DO UPDATE SET config = ?',
		[user_id, config, config]
	);
}

export function getDashboard(user_id: string): Dashboard {
	const dashboard_config = db.getColumn<string>('SELECT config FROM dashboards WHERE user_id = ?', [
		user_id
	]);
	if (!dashboard_config) {
		return DASHBOARD_DEFAULT;
	}
	return JSON.parse(dashboard_config);
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
