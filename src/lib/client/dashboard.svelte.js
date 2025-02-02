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

export const DASHBOARD_VIEWS = [
	DASHBOARD_VIEW.DASHBOARD,
	DASHBOARD_VIEW.INTRO,
	DASHBOARD_VIEW.SETTINGS
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

/**
 * @typedef {Object} DashboardContentState
 * @property {Dashboard} dashboard
 * @property {Dashboard} dashboard_edit
 */

/** @type {DashboardContentState} */
let dashboard_content_state = $state({
	application_edit: {
		group_index: null,
		application_index: null
	},
	application_add: {
		group_index: null,
		icon: '',
		name: '',
		link: ''
	},
	bookmark_edit: {
		group_index: null,
		bookmark_index: null
	},
	bookmark_add: {
		group_index: null,
		title: '',
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
		},
		addBookmarkGroup(title) {
			dashboard_content_state.dashboard_edit.bookmarkGroups.push({
				title,
				bookmarks: []
			});
		},
		setBookmarkGroupTitle(group_index, title) {
			dashboard_content_state.dashboard_edit.bookmarkGroups[group_index].title = title;
		},
		deleteBookmarkGroup(group_index) {
			dashboard_content_state.dashboard_edit.bookmarkGroups.splice(group_index, 1);
		},
		setBookmarkCreate(group_index) {
			dashboard_content_state.bookmark_add = {
				group_index,
				title: '',
				link: ''
			};
		},
		addBookmark(group_index, title, link) {
			dashboard_content_state.dashboard_edit.bookmarkGroups[group_index].bookmarks.push({
				title,
				link
			});
		},
		setBookmarkEdit(group_index, bookmark_index) {
			dashboard_content_state.bookmark_edit = {
				group_index,
				bookmark_index
			};
		},

		/**
		 * @returns {import("$lib/server/dashboard").Bookmark}
		 */
		getBookmarkEdit() {
			const bookmark_edit = dashboard_content_state.bookmark_edit;
			const group_index = bookmark_edit.group_index;
			const bookmark_index = bookmark_edit.bookmark_index;
			if (group_index === null || bookmark_index === null) {
				return { title: '', link: '' };
			}
			const bookmark_groups = dashboard_content_state.dashboard_edit.bookmarkGroups;
			return bookmark_groups[group_index].bookmarks[bookmark_index];
		},
		saveBookmarkEdit(title, link) {
			const bookmark_edit = dashboard_content_state.bookmark_edit;
			const group_index = bookmark_edit.group_index;
			const bookmark_index = bookmark_edit.bookmark_index;
			dashboard_content_state.dashboard_edit.bookmarkGroups[group_index].bookmarks[bookmark_index] =
				{ title, link };
		},
		deleteBookmarkEdit() {
			const bookmark_edit = dashboard_content_state.bookmark_edit;
			const groupIndex = bookmark_edit.group_index;
			const bookmarkIndex = bookmark_edit.bookmark_index;
			dashboard_content_state.dashboard_edit.bookmarkGroups[groupIndex].bookmarks.splice(
				bookmarkIndex,
				1
			);
		},
		addApplicationGroup(title) {
			dashboard_content_state.dashboard_edit.applicationGroups.push({
				title,
				applications: []
			});
		},
		setApplicationGroupTitle(group_index, title) {
			dashboard_content_state.dashboard_edit.applicationGroups[group_index].title = title;
		},
		deleteApplicationGroup(group_index) {
			dashboard_content_state.dashboard_edit.applicationGroups.splice(group_index, 1);
		},
		setApplicationCreate(group_index) {
			dashboard_content_state.application_add = {
				group_index,
				icon: '',
				name: '',
				link: ''
			};
		},
		addApplication(group_index, icon, name, link) {
			dashboard_content_state.dashboard_edit.applicationGroups[group_index].applications.push({
				icon,
				name,
				link
			});
		},
		setApplicationEdit(group_index, application_index) {
			dashboard_content_state.application_edit = {
				group_index,
				application_index
			};
		},
		/**
		 * @returns {import("$lib/server/dashboard").Application}
		 */
		getApplicationEdit() {
			const application_edit = dashboard_content_state.application_edit;
			const group_index = application_edit.group_index;
			const application_index = application_edit.application_index;
			if (group_index === null || application_index === null) {
				return { icon: null, name: '', link: '' };
			}
			const application_groups = dashboard_content_state.dashboard_edit.applicationGroups;
			return application_groups[group_index].applications[application_index];
		},
		saveApplicationEdit(icon, name, link) {
			const application_edit = dashboard_content_state.application_edit;
			const group_index = application_edit.group_index;
			const application_index = application_edit.application_index;
			dashboard_content_state.dashboard_edit.applicationGroups[group_index].applications[
				application_index
			] = { icon, name, link };
		},
		deleteApplicationEdit() {
			const application_edit = dashboard_content_state.application_edit;
			const group_index = application_edit.group_index;
			const application_index = application_edit.application_index;
			dashboard_content_state.dashboard_edit.applicationGroups[group_index].applications.splice(
				application_index,
				1
			);
		},
		setDashboardEdit: () => {
			dashboard_content_state.dashboard_edit = {
				...dashboard_content_state.dashboard
			};
		},
		commitDashboardEdit: () => {
			dashboard_content_state.dashboard = {
				...dashboard_content_state.dashboard_edit
			};
		}
	};
}
export const dashboard_content = createDashboardContent();
