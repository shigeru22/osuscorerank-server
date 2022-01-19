import axios from "axios";
import _ from "lodash";
import { ClientCredentialsPOSTRequest, ClientCredentialsPOSTResponse } from "../types/osu-api";
import { HTTPStatus } from "./http";

const OSU_API_OAUTH_ENDPOINT = "https://osu.ppy.sh/oauth/token";
const OSU_API_ENDPOINT = "https://osu.ppy.sh/api/v2";

export async function getAccessToken(clientId: number, clientSecret: string) {
	try {
		const request: ClientCredentialsPOSTRequest = {
			client_id: clientId,
			client_secret: clientSecret,
			grant_type: "client_credentials",
			scope: "public"
		};

		const response = await axios.post<ClientCredentialsPOSTResponse>(OSU_API_OAUTH_ENDPOINT, request);

		if(response.status === HTTPStatus.OK) {
			/* TODO: remove console.log when no longer needed */
			console.log(`[DEBUG] Access token: ${ response.data.access_token }`);
			return response.data.access_token;
		}
		else {
			console.log(`[WARN] API returned status ${ response.status }`);
			console.log(`[WARN] Response data:\n${ JSON.stringify(response.data) }`);
		}

		return !_.isUndefined(response.data.access_token) ? response.data.access_token : "";
	}
	catch (e) {
		if(axios.isAxiosError(e)) {
			if(!_.isUndefined(e.response)) {
				console.log(`[ERROR] API returned status ${ e.response.status }.`);
				console.log(`[ERROR] Response data:\n${ JSON.stringify(e.response.data) }`);
			}
			else {
				console.log("[ERROR] API returned undefined status code.");
			}
		}
		else if(_.isError(e)) {
			console.log(`[ERROR] Error while retrieving score data: ${ e.message }`);
		}
		else {
			console.log("[ERROR] Unknown error occurred while retrieving score ranking data.");
		}

		return "";
	}
}
