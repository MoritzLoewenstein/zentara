export type OauthProfileBasic = {
	primary: string;
	secondary: string;
};

export type PolarFlowProfile = {
	basicInfo: {
		firstName: string;
		lastName: string;
		email: string;
	};
	physicalInformation: {
		birthday: string; // YYYY-MM-DD
	};
};
