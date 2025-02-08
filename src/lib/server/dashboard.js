import db from "./db.js";

/**
 *
 * @export
 * @param {string} user_id
 * @param {Dashboard} dashboard
 */
export function saveDashboard(user_id, dashboard_config) {
	const config = JSON.stringify(dashboard_config);
	db.exec(
		"INSERT INTO dashboards (user_id, config) VALUES (?, ?) ON CONFLICT (user_id) DO UPDATE SET config = ?",
		[user_id, config, config],
	);
}

/**
 * @export
 * @param {string} user_id
 * @returns {?Dashboard}
 */
export function getDashboard(user_id) {
	const dashboard_config = db.getColumn(
		"SELECT config FROM dashboards WHERE user_id = ?",
		[user_id],
	);
	if (!dashboard_config) {
		return DASHBOARD_DEFAULT;
	}
	return JSON.parse(dashboard_config);
}

/**@type {Dashboard} */
const DASHBOARD_DEFAULT = {
	applicationGroups: [
		{
			title: "Applications",
			applications: [
				{
					icon: "",
					name: "Example Application",
					link: "https://example.com",
				},
			],
		},
	],
	bookmarkGroups: [
		{
			title: "Bookmarks",
			bookmarks: [
				{
					title: "Example Bookmark",
					link: "https://example.com",
				},
			],
		},
	],
};

/**
 * Represents an individual application entry.
 * @typedef {Object} Application
 * @property {string} icon - The icon identifier or URL for the application.
 * @property {string} name - The display name of the application.
 * @property {string} link - The URL link to the application.
 */

/**
 * A group containing multiple applications.
 * @typedef {Object} ApplicationGroup
 * @property {string} title - The title of this application group.
 * @property {Application[]} applications - The list of applications within this group.
 */

/**
 * Represents an individual bookmark entry.
 * @typedef {Object} Bookmark
 * @property {string} title - The display title of the bookmark.
 * @property {string} link - The URL link the bookmark points to.
 * @property {boolean} movePreview - wether the displayed bookmark is a preview of a move operation
 * @property {boolean} moving - wether the bookmark is currently being moved
 */

/**
 * A group containing multiple bookmarks.
 * @typedef {Object} BookmarkGroup
 * @property {string} title - The title of this bookmark group.
 * @property {Bookmark[]} bookmarks - The list of bookmarks within this group.
 */

/**
 * The overall dashboard object that contains application groups and bookmark groups.
 * @typedef {Object} Dashboard
 * @property {ApplicationGroup[]} applicationGroups - The list of all application groups on the dashboard.
 * @property {BookmarkGroup[]} bookmarkGroups - The list of all bookmark groups on the dashboard.
 */
