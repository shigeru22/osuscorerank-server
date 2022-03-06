import axios from "axios";
import _ from "lodash";
import { IClientCredentialsPOSTRequest, IClientCredentialsPOSTResponse, IRankingsGETResponse } from "../../types/osu/osu-api";
import { IRankingsCursor, IUserStatistics } from "../../types/osu/osu-structures";
import { sleep } from "../common";
import { HTTPStatus } from "../http";
import { LogLevel, log } from "../log";

const OSU_API_OAUTH_ENDPOINT = "https://osu.ppy.sh/oauth/token";
const OSU_API_ENDPOINT = "https://osu.ppy.sh/api/v2";

export async function getAccessToken(clientId: number, clientSecret: string) {
	try {
		const request: IClientCredentialsPOSTRequest = {
			client_id: clientId,
			client_secret: clientSecret,
			grant_type: "client_credentials",
			scope: "public"
		};

		const response = await axios.post<IClientCredentialsPOSTResponse>(OSU_API_OAUTH_ENDPOINT, request);

		if(response.status === HTTPStatus.OK) {
			return response.data.access_token;
		}
		else {
			log(`API returned status ${ response.status }`, LogLevel.WARN);
			log(`Response data:\n${ JSON.stringify(response.data) }`, LogLevel.WARN);
		}

		return !_.isUndefined(response.data.access_token) ? response.data.access_token : "";
	}
	catch (e) {
		if(axios.isAxiosError(e)) {
			if(!_.isUndefined(e.response)) {
				log(`API returned status ${ e.response.status }.`, LogLevel.ERROR);
				log(`Response data:\n${ JSON.stringify(e.response.data) }`, LogLevel.ERROR);
			}
			else {
				log("API returned undefined status code.", LogLevel.ERROR);
			}
		}
		else if(_.isError(e)) {
			log(`Error while retrieving score data: ${ e.message }`, LogLevel.ERROR);
		}
		else {
			log("Unknown error occurred while retrieving score ranking data.", LogLevel.ERROR);
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
			log(`[WARN] API returned status ${ response.status }`, LogLevel.WARN);
			log(`[WARN] Response data:\n${ JSON.stringify(response.data) }`, LogLevel.WARN);
			return false;
		}

		return true;
	}
	catch (e) {
		if(axios.isAxiosError(e)) {
			if(!_.isUndefined(e.response)) {
				log(`[ERROR] API returned status ${ e.response.status }.`, LogLevel.ERROR);
				log(`[ERROR] Response data:\n${ JSON.stringify(e.response.data) }`, LogLevel.ERROR);
			}
			else {
				log("[ERROR] API returned undefined status code.", LogLevel.ERROR);
			}
		}
		else if(_.isError(e)) {
			log(`[ERROR] Error while revoking access token: ${ e.message }`, LogLevel.ERROR);
		}
		else {
			log("[ERROR] Unknown error occurred while revoking access token.", LogLevel.ERROR);
		}

		return false;
	}
}

export async function getScoreRanking(countryCode: string, token: string) {
	try {
		let loop = true;
		let page = 1;

		let ret: IUserStatistics[] = [];

		do {
			process.stdout.write(`[INFO] Requesting rankings (page: ${ page })...`);

			/* disable this since looping require cursor */
			// eslint-disable-next-line no-await-in-loop
			const response = await axios.get<IRankingsGETResponse<IRankingsCursor>>(`${ OSU_API_ENDPOINT }/rankings/osu/performance?country=${ countryCode }&page=${ page }`, { // TODO: update API links
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
					await sleep(1000);

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
				log(`[ERROR] API returned status ${ e.response.status }.`, LogLevel.ERROR);
				log(`[ERROR] Response data:\n${ e.response.data }`, LogLevel.ERROR);
			}
			else {
				log("[ERROR] API returned undefined status code.", LogLevel.ERROR);
			}
		}
		else if(_.isError(e)) {
			log(`[ERROR] Error while retrieving score data: ${ e.message }`, LogLevel.ERROR);
		}
		else {
			log("[ERROR] Unknown error occurred while retrieving score ranking data.", LogLevel.ERROR);
		}

		return null;
	}
}
