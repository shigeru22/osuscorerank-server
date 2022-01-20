import axios from "axios";
import _ from "lodash";
import { ClientCredentialsPOSTRequest, ClientCredentialsPOSTResponse, RankingsGETResponse } from "../../types/osu/osu-api";
import { RankingsCursor, UserStatistics } from "../../types/osu/osu-structures";
import { sleep } from "../common";
import { HTTPStatus } from "../http";

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

export async function revokeAccessToken(token: string) {
	try {
		const response = await axios.delete(`${ OSU_API_ENDPOINT }/oauth/tokens/current`, {
			headers: {
				Authorization: `Bearer ${ token }`
			}
		});

		if(response.status !== HTTPStatus.NO_CONTENT) {
			console.log(`[WARN] API returned status ${ response.status }`);
			console.log(`[WARN] Response data:\n${ JSON.stringify(response.data) }`);
			return false;
		}

		return true;
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
			console.log(`[ERROR] Error while revoking access token: ${ e.message }`);
		}
		else {
			console.log("[ERROR] Unknown error occurred while revoking access token.");
		}

		return false;
	}
}

export async function getScoreRanking(token: string) {
	try {
		let loop = true;
		let page = 1;

		let ret: UserStatistics[] = [];

		do {
			process.stdout.write(`[INFO] Requesting rankings (page: ${ page })...`);

			/* disable this since looping require cursor */
			// eslint-disable-next-line no-await-in-loop
			const response = await axios.get<RankingsGETResponse<RankingsCursor>>(`${ OSU_API_ENDPOINT }/rankings/osu/score?page=${ page }`, {
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${ token }`
				}
			});

			if(response.status === HTTPStatus.OK) {
				ret = _.concat(ret, response.data.ranking);

				if(!_.isNull(response.data.cursor) && !_.isUndefined(response.data.cursor.page)) {
					page = response.data.cursor.page;

					/* prevent abuse by limiting rate */
					// eslint-disable-next-line no-await-in-loop
					await sleep(1500);

					process.stdout.clearLine(0);
					process.stdout.cursorTo(0);
				}
				else {
					loop = false;
				}
			}
			else if(response.status === HTTPStatus.UNAUTHORIZED) {
				process.stdout.write("[WARN] Token expired or invalid. Retrying...");

				/* TODO: refresh access token */
			}
			else {
				process.stdout.write(`[WARN] API returned status ${ response.status }\n`);
				process.stdout.write(`[WARN] Response data:\n${ JSON.stringify(response.data) }\n`);
				return null;
			}

			if(page > 1) break; // limit to this
		}
		while(loop);

		return ret;
	}
	catch (e) {
		if(axios.isAxiosError(e)) {
			if(!_.isUndefined(e.response)) {
				console.log(`[ERROR] API returned status ${ e.response.status }.`);
				console.log(`[ERROR] Response data:\n${ e.response.data }`);
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

		return null;
	}
}
