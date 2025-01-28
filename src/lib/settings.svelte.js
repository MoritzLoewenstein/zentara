export const DASHBOARD_VIEW = {
	DASHBOARD: "default",
	INTRO: "intro",
	SETTINGS: "settings",
	EDIT: "edit",
	CREATE_APPLICATION: "create_application",
	CREATE_BOOKMARK: "create_bookmark",
	EDIT_APPLICATION: "edit_application",
	EDIT_BOOKMARK: "edit_bookmark",
};

export const EDIT_VIEWS = [
	DASHBOARD_VIEW.EDIT,
	DASHBOARD_VIEW.CREATE_APPLICATION,
	DASHBOARD_VIEW.CREATE_BOOKMARK,
	DASHBOARD_VIEW.EDIT_APPLICATION,
	DASHBOARD_VIEW.EDIT_BOOKMARK,
];

let dashboard_view_state = $state(DASHBOARD_VIEW.DASHBOARD);
function createDashboardView() {
	return {
		get value() {
			return dashboard_view_state;
		},
		set: (mode) => {
			if (!Object.values(DASHBOARD_VIEW).includes(mode)) {
				throw new Error(`Invalid dashboard mode: ${mode}`);
			}
			dashboard_view_state = mode;
		},
	};
}
export const dashboard_view = createDashboardView();

let dashboard_content_state = $state({
	bookmark_edit: {
		title: "",
		link: "",
	},
	bookmark_add: {
		title: "",
		link: "",
	},
	application_edit: {
		icon: "",
		name: "",
		link: "",
	},
	application_add: {
		icon: "",
		name: "",
		link: "",
	},
	dashboard: { applicationGroups: [], bookmarkGroups: [] },
	dashboard_edit: { applicationGroups: [], bookmarkGroups: [] },
});
function createDashboardContent() {
	return {
		get value() {
			return dashboard_content_state;
		},
		set: (content) => {
			dashboard_content_state = content;
		},
		update: (content) => {
			dashboard_content_state = { ...dashboard_content_state, ...content };
		},
	};
}
export const dashboard_content = createDashboardContent();

/**@typedef {import('../lib/server/dashboard').Dashboard} Dashboard */
/**@type {Dashboard} */
export const DASHBOARD_DEFAULT = {
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
