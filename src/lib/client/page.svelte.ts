let page_state = $state(0);
const page_idx = {
	get value() {
		return page_state;
	},
	set: (pagenumber: number) => {
		page_state = pagenumber;
	}
};

export { page_idx };
