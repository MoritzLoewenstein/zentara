export const DASHBOARD_VIEW = {
	DASHBOARD: 'default',
	INTRO: 'intro',
	SETTINGS: 'settings',
	EDIT: 'edit',
	APPLICATION_CREATE: 'application_create',
	APPLICATION_EDIT: 'application_edit',
	BOOKMARK_CREATE: 'bookmark_create',
	BOOKMARK_EDIT: 'bookmark_edit'
};

export const EDIT_VIEWS = [
	DASHBOARD_VIEW.EDIT,
	DASHBOARD_VIEW.APPLICATION_CREATE,
	DASHBOARD_VIEW.APPLICATION_EDIT,
	DASHBOARD_VIEW.BOOKMARK_CREATE,
	DASHBOARD_VIEW.BOOKMARK_EDIT
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
		}
	};
}
export const dashboard_view = createDashboardView();

let dashboard_content_state = $state({
	bookmark_edit: {
		group_index: null,
		bookmark_index: null
	},
	bookmark_add: {
		title: '',
		link: ''
	},
	application_edit: {
		group_index: null,
		application_index: null
	},
	application_add: {
		icon: '',
		name: '',
		link: ''
	},
	dashboard: { applicationGroups: [], bookmarkGroups: [] },
	dashboard_edit: { applicationGroups: [], bookmarkGroups: [] }
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
		}
	};
}
export const dashboard_content = createDashboardContent();

/**@typedef {import('../lib/server/dashboard').Dashboard} Dashboard */
/**@type {Dashboard} */
export const DASHBOARD_DEFAULT = {
	applicationGroups: [
		{
			title: 'Applications',
			applications: [
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
			bookmarks: [
				{
					title: 'Example Bookmark',
					link: 'https://example.com'
				}
			]
		}
	]
};
