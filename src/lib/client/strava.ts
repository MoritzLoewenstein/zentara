import type { OauthProfileBasic } from '$lib/shared/types';

type StravaProfile = {
	firstname: string;
	lastname: string;
	state: string;
	country: string;
};

class Strava {
	profileToBasic(profile: StravaProfile): OauthProfileBasic {
		const { firstname, lastname, state, country } = profile;

		const primary =
			firstname && lastname ? `${firstname.slice(0, 1)}. ${lastname}`.trim() : 'no_name';
		const secondary = state && country ? `${state}, ${country}` : 'no_location';
		return { primary, secondary };
	}
}

const instance = new Strava();
export default instance;
