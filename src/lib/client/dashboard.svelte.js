import { MOVE_TYPES } from './draggable';

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

// eslint-disable-next-line no-undef
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
// eslint-disable-next-line no-undef
let dashboard_content_state = $state({
	move: {
		type: null,
		group_index: null,
		item_index: null
	},
	move_preview: {
		group_index: null,
		item_index: null
	},
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
	let movePreviewTimeout = null;
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
		addBookmarkGroup(title = '') {
			dashboard_content_state.dashboard_edit.bookmarkGroups.push({
				title,
				items: []
			});
		},
		setBookmarkGroupTitle(group_index, title) {
			dashboard_content_state.dashboard_edit.bookmarkGroups[group_index].title = title;
		},
		deleteBookmarkGroup(group_index) {
			dashboard_content_state.dashboard_edit.bookmarkGroups.splice(group_index, 1);
		},
		setBookmarkAdd(group_index) {
			dashboard_content_state.bookmark_add = group_index;
		},
		addBookmark(title, link) {
			const group_index = dashboard_content_state.bookmark_add;
			dashboard_content_state.dashboard_edit.bookmarkGroups[group_index].items.push({
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
			return bookmark_groups[group_index].items[bookmark_index];
		},
		saveBookmarkEdit(title, link) {
			const bookmark_edit = dashboard_content_state.bookmark_edit;
			const group_index = bookmark_edit.group_index;
			const bookmark_index = bookmark_edit.bookmark_index;
			dashboard_content_state.dashboard_edit.bookmarkGroups[group_index].items[bookmark_index] = {
				title,
				link
			};
		},
		deleteBookmarkEdit() {
			const bookmark_edit = dashboard_content_state.bookmark_edit;
			const groupIndex = bookmark_edit.group_index;
			const bookmarkIndex = bookmark_edit.bookmark_index;
			dashboard_content_state.dashboard_edit.bookmarkGroups[groupIndex].items.splice(
				bookmarkIndex,
				1
			);
		},
		setMove(type, group_index, item_index = null) {
			dashboard_content_state.move = {
				type,
				group_index,
				item_index
			};
		},
		getMove() {
			const { type, group_index, item_index } = dashboard_content_state.move;
			const groupKey =
				type === MOVE_TYPES.APPLICATION || type === MOVE_TYPES.APPLICATION_GROUP
					? 'applicationGroups'
					: 'bookmarkGroups';
			if (type === MOVE_TYPES.APPLICATION_GROUP || type === MOVE_TYPES.BOOKMARK_GROUP) {
				if (group_index === null) {
					return null;
				}
				return dashboard_content_state.dashboard_edit[groupKey][group_index];
			}

			if (group_index === null || item_index === null) {
				return null;
			}

			return dashboard_content_state.dashboard_edit[groupKey][group_index].items[item_index];
		},
		resetMove() {
			dashboard_content_state.move = {
				type: null,
				group_index: null,
				item_index: null
			};
		},
		updateMovePreview(group_index, item_index = null) {
			if (movePreviewTimeout !== null) {
				clearTimeout(movePreviewTimeout);
			}
			movePreviewTimeout = setTimeout(() => {
				this.resetMovePreview(false);
				const { type } = dashboard_content_state.move;
				const groupKey =
					type === MOVE_TYPES.APPLICATION || type === MOVE_TYPES.APPLICATION_GROUP
						? 'applicationGroups'
						: 'bookmarkGroups';
				dashboard_content_state.move_preview = {
					group_index,
					item_index
				};
				const item = this.getMove();
				if (type === MOVE_TYPES.APPLICATION_GROUP || type === MOVE_TYPES.BOOKMARK_GROUP) {
					if (group_index === null) {
						movePreviewTimeout = null;
						return;
					}
					dashboard_content_state.dashboard_edit[groupKey].splice(group_index, 0, {
						...item,
						movePreview: true
					});
				} else {
					if (group_index === null || item_index === null) {
						movePreviewTimeout = null;
						return;
					}
					dashboard_content_state.dashboard_edit[groupKey][group_index].items.splice(
						item_index,
						0,
						{
							...item,
							movePreview: true
						}
					);
				}
				movePreviewTimeout = null;
			}, 50);
		},
		resetMovePreview(resetTimeout = true) {
			if (resetTimeout) {
				clearTimeout(movePreviewTimeout);
			}
			const { type } = dashboard_content_state.move;
			const { group_index, item_index } = dashboard_content_state.move_preview;
			const groupKey =
				type === MOVE_TYPES.APPLICATION || type === MOVE_TYPES.APPLICATION_GROUP
					? 'applicationGroups'
					: 'bookmarkGroups';
			dashboard_content_state.move_preview = {
				type: null,
				group_index: null,
				item_index: null
			};
			if (type === MOVE_TYPES.APPLICATION_GROUP || type === MOVE_TYPES.BOOKMARK_GROUP) {
				if (group_index === null) {
					return null;
				}
				dashboard_content_state.dashboard_edit[groupKey].splice(group_index, 1);
			}

			if (group_index === null || item_index === null) {
				return null;
			}

			dashboard_content_state.dashboard_edit[groupKey][group_index].items.splice(item_index, 1);
		},
		moveItem(type, item, target_group_index, target_item_index = null) {
			const groupKey =
				type === MOVE_TYPES.APPLICATION || type === MOVE_TYPES.APPLICATION_GROUP
					? 'applicationGroups'
					: 'bookmarkGroups';
			// step 1: remove item from current position
			if (type === MOVE_TYPES.APPLICATION_GROUP || type === MOVE_TYPES.BOOKMARK_GROUP) {
				dashboard_content_state.dashboard_edit[groupKey].splice(item.groupIndex, 1);
			} else {
				dashboard_content_state.dashboard_edit[groupKey][item.groupIndex].items.splice(
					item.itemIndex,
					1
				);
			}

			// step 2: insert item at new position
			if (type === MOVE_TYPES.APPLICATION_GROUP || type === MOVE_TYPES.BOOKMARK_GROUP) {
				dashboard_content_state.dashboard_edit[groupKey].splice(target_group_index, 0, { ...item });
			} else {
				dashboard_content_state.dashboard_edit[groupKey][target_group_index].items.splice(
					target_item_index,
					0,
					{ ...item }
				);
			}
		},
		addApplicationGroup(title = '') {
			dashboard_content_state.dashboard_edit.applicationGroups.push({
				title,
				items: []
			});
		},
		setApplicationGroupTitle(group_index, title) {
			dashboard_content_state.dashboard_edit.applicationGroups[group_index].title = title;
		},
		deleteApplicationGroup(group_index) {
			dashboard_content_state.dashboard_edit.applicationGroups.splice(group_index, 1);
		},
		setApplicationAdd(group_index) {
			dashboard_content_state.application_add = group_index;
		},
		addApplication(icon, name, link) {
			const group_index = dashboard_content_state.application_add;
			dashboard_content_state.dashboard_edit.applicationGroups[group_index].items.push({
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
			return application_groups[group_index].items[application_index];
		},
		saveApplicationEdit(icon, name, link) {
			const application_edit = dashboard_content_state.application_edit;
			const group_index = application_edit.group_index;
			const application_index = application_edit.application_index;
			dashboard_content_state.dashboard_edit.applicationGroups[group_index].items[
				application_index
			] = { icon, name, link };
		},
		deleteApplicationEdit() {
			const application_edit = dashboard_content_state.application_edit;
			const group_index = application_edit.group_index;
			const application_index = application_edit.application_index;
			dashboard_content_state.dashboard_edit.applicationGroups[group_index].items.splice(
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
