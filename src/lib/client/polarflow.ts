import type { OauthProfileBasic, PolarFlowProfile } from '$lib/shared/types';

class PolarFlow {
	profileToBasic(profile: PolarFlowProfile): OauthProfileBasic {
		const firstName = profile.basicInfo.firstName;
		const lastName = profile.basicInfo.lastName;
		const birthday = profile.physicalInformation.birthday;

		if (!(firstName && lastName && birthday)) {
			return {
				primary: 'no_name',
				secondary: ''
			};
		}

		const name = `${firstName.slice(0, 1)}. ${lastName}`.trim();
		return {
			primary: name,
			secondary: birthday.split('-').reverse().join('-') // YYYY-MM-DD to DD-MM-YYYY
		};
	}
}

const instance = new PolarFlow();
export default instance;
