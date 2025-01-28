export const DASHBOARD_STATES = {
	DEFAULT: 'default',
	INTRO: 'intro',
	SETTINGS: 'settings',
	EDIT: 'edit',
	CREATE_APPLICATION: 'create_application',
	CREATE_BOOKMARK: 'create_bookmark',
	EDIT_APPLICATION: 'edit_application',
	EDIT_BOOKMARK: 'edit_bookmark'
};

export const EDIT_MODES = [
	DASHBOARD_STATES.EDIT,
	DASHBOARD_STATES.CREATE_APPLICATION,
	DASHBOARD_STATES.CREATE_BOOKMARK,
	DASHBOARD_STATES.EDIT_APPLICATION,
	DASHBOARD_STATES.EDIT_BOOKMARK
];

function createDashboardState() {
	let dashboard_state = $state(DASHBOARD_STATES.DEFAULT);
	return {
		get state() {
			return dashboard_state;
		},
		set: (mode) => {
			if (!Object.values(DASHBOARD_STATES).includes(mode)) {
				throw new Error(`Invalid dashboard mode: ${mode}`);
			}
			dashboard_state = mode;
		}
	};
}

export const dashboard_state = createDashboardState();
