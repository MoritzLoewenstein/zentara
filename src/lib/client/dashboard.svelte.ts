import type { Dashboard, Application, Bookmark } from '$lib/server/dashboard';

export const DASHBOARD_VIEW = {
	DASHBOARD: 'default',
	INTRO: 'intro',
	SETTINGS: 'settings',
	EDIT: 'edit',
	APPLICATION_CREATE: 'application_create',
	APPLICATION_EDIT: 'application_edit',
	BOOKMARK_CREATE: 'bookmark_create',
	BOOKMARK_EDIT: 'bookmark_edit'
} as const;

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

type DashboardViewType = (typeof DASHBOARD_VIEW)[keyof typeof DASHBOARD_VIEW];

let dashboard_view_state = $state<DashboardViewType>(DASHBOARD_VIEW.DASHBOARD);

function createDashboardView() {
	return {
		get value() {
			return dashboard_view_state;
		},
		set: (mode: DashboardViewType) => {
			if (!Object.values(DASHBOARD_VIEW).includes(mode)) {
				throw new Error(`Invalid dashboard mode: ${mode}`);
			}
			dashboard_view_state = mode;
		}
	};
}

export const dashboard_view = createDashboardView();

interface DashboardContentState {
	application_edit: {
		group_index: number | null;
		application_index: number | null;
	};
	application_add: number | null;
	bookmark_edit: {
		group_index: number | null;
		bookmark_index: number | null;
	};
	bookmark_add: number | null;
	dashboard: Dashboard;
	dashboard_edit: Dashboard;
}

let dashboard_content_state = $state<DashboardContentState>({
	application_edit: {
		group_index: null,
		application_index: null
	},
	application_add: null,
	bookmark_edit: {
		group_index: null,
		bookmark_index: null
	},
	bookmark_add: null,
	dashboard: { applicationGroups: [], bookmarkGroups: [] },
	dashboard_edit: { applicationGroups: [], bookmarkGroups: [] }
});

function createDashboardContent() {
	return {
		get value() {
			return dashboard_content_state;
		},
		set: (content: DashboardContentState) => {
			dashboard_content_state = content;
		},
		update: (content: Partial<DashboardContentState>) => {
			dashboard_content_state = { ...dashboard_content_state, ...content };
		},
		addBookmarkGroup(title: string = '') {
			dashboard_content_state.dashboard_edit.bookmarkGroups.push({
				title,
				items: []
			});
		},
		setBookmarkGroupTitle(group_index: number, title: string) {
			dashboard_content_state.dashboard_edit.bookmarkGroups[group_index].title = title;
		},
		deleteBookmarkGroup(group_index: number) {
			dashboard_content_state.dashboard_edit.bookmarkGroups.splice(group_index, 1);
		},
		setBookmarkAdd(group_index: number) {
			dashboard_content_state.bookmark_add = group_index;
		},
		addBookmark(title: string, link: string) {
			const group_index = dashboard_content_state.bookmark_add;
			if (group_index !== null) {
				dashboard_content_state.dashboard_edit.bookmarkGroups[group_index].items.push({
					title,
					link
				});
			}
		},
		setBookmarkEdit(group_index: number, bookmark_index: number) {
			dashboard_content_state.bookmark_edit = {
				group_index,
				bookmark_index
			};
		},
		getBookmarkEdit(): Bookmark {
			const bookmark_edit = dashboard_content_state.bookmark_edit;
			const group_index = bookmark_edit.group_index;
			const bookmark_index = bookmark_edit.bookmark_index;
			if (group_index === null || bookmark_index === null) {
				return { title: '', link: '' };
			}
			const bookmark_groups = dashboard_content_state.dashboard_edit.bookmarkGroups;
			return bookmark_groups[group_index].items[bookmark_index];
		},
		saveBookmarkEdit(title: string, link: string) {
			const bookmark_edit = dashboard_content_state.bookmark_edit;
			const group_index = bookmark_edit.group_index;
			const bookmark_index = bookmark_edit.bookmark_index;
			if (group_index !== null && bookmark_index !== null) {
				dashboard_content_state.dashboard_edit.bookmarkGroups[group_index].items[bookmark_index] =
					{
						title,
						link
					};
			}
		},
		deleteBookmarkEdit() {
			const bookmark_edit = dashboard_content_state.bookmark_edit;
			const groupIndex = bookmark_edit.group_index;
			const bookmarkIndex = bookmark_edit.bookmark_index;
			if (groupIndex !== null && bookmarkIndex !== null) {
				dashboard_content_state.dashboard_edit.bookmarkGroups[groupIndex].items.splice(
					bookmarkIndex,
					1
				);
			}
		},

		addApplicationGroup(title: string = '') {
			dashboard_content_state.dashboard_edit.applicationGroups.push({
				title,
				items: []
			});
		},
		setApplicationGroupTitle(group_index: number, title: string) {
			dashboard_content_state.dashboard_edit.applicationGroups[group_index].title = title;
		},
		deleteApplicationGroup(group_index: number) {
			dashboard_content_state.dashboard_edit.applicationGroups.splice(group_index, 1);
		},
		setApplicationAdd(group_index: number) {
			dashboard_content_state.application_add = group_index;
		},
		addApplication(icon: string | null, name: string, link: string) {
			const group_index = dashboard_content_state.application_add;
			if (group_index !== null) {
				dashboard_content_state.dashboard_edit.applicationGroups[group_index].items.push({
					icon,
					name,
					link
				});
			}
		},
		setApplicationEdit(group_index: number, application_index: number) {
			dashboard_content_state.application_edit = {
				group_index,
				application_index
			};
		},
		getApplicationEdit(): Application {
			const application_edit = dashboard_content_state.application_edit;
			const group_index = application_edit.group_index;
			const application_index = application_edit.application_index;
			if (group_index === null || application_index === null) {
				return { icon: null, name: '', link: '' };
			}
			const application_groups = dashboard_content_state.dashboard_edit.applicationGroups;
			return application_groups[group_index].items[application_index];
		},
		saveApplicationEdit(icon: string | null, name: string, link: string) {
			const application_edit = dashboard_content_state.application_edit;
			const group_index = application_edit.group_index;
			const application_index = application_edit.application_index;
			if (group_index !== null && application_index !== null) {
				dashboard_content_state.dashboard_edit.applicationGroups[group_index].items[
					application_index
				] = { icon, name, link };
			}
		},
		deleteApplicationEdit() {
			const application_edit = dashboard_content_state.application_edit;
			const group_index = application_edit.group_index;
			const application_index = application_edit.application_index;
			if (group_index !== null && application_index !== null) {
				dashboard_content_state.dashboard_edit.applicationGroups[group_index].items.splice(
					application_index,
					1
				);
			}
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
