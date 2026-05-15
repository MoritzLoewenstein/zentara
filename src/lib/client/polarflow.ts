type OauthProfileBasic = {
	name: string;
	birthday: string; // DD-MM-YYYY
};

type PolarFlowProfile = {
	basicInfo: {
		firstName: string;
		lastName: string;
	};
	physicalInformation: {
		birthday: string; // YYYY-MM-DD
	};
};

class PolarFlow {
	profileToBasic(profile: PolarFlowProfile): OauthProfileBasic {
		const firstName = profile.basicInfo.firstName;
		const lastName = profile.basicInfo.lastName;
		const birthday = profile.physicalInformation.birthday;

		if (!(firstName && lastName && birthday)) {
			return {
				name: 'no name',
				birthday: 'no birthday'
			};
		}

		const name = `${firstName.slice(0, 1)}. ${lastName}`.trim();
		return {
			name,
			birthday: birthday.split('-').reverse().join('-')
		};
	}
}

const instance = new PolarFlow();
export default instance;
