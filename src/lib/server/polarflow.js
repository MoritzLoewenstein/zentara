import { env } from "$env/dynamic/private";
import { token } from "./util/token";
import { setSessionOauthState, verifySessionOauthState } from "./session";


class PolarFlow {
    getAuthUrl(session_id) {
        const url = new URL("https://flow.polar.com/oauth2/authorization");
        url.searchParams.append("response_type", "code");
        url.searchParams.append("client_id", env.POLARFLOW_CLIENT_ID);
        url.searchParams.append("redirect_uri", `${env.ORIGIN}/oauth/polarflow`);
        const state = token();
        url.searchParams.append("state", state);
        setSessionOauthState(state);
        //TODO save state csrf token in db with specific validity?
        return url.toString();
    }

    async getAccessToken(user_id, oauth_code) {
        const searchParams = new URLSearchParams();
        searchParams.append("grant_type", "authorization_code");
        searchParams.append("code", oauth_code);
        searchParams.append("redirect_uri", `${env.ORIGIN}/oauth/polarflow`);
        const res = await fetch("https://polarremote.com/v2/oauth2/token", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: searchParams
        }).then((r) => r.json());


        if(res.error) {
            console.error("PolarFlow getAccessToken failed", res);
            return false;
        }

        //TODO save user_id, polarflow_user_id, access_token
    }
}

const instance = new PolarFlow();
export default instance;