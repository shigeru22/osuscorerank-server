import axios from "axios";
import _ from "lodash";
import { IClientCredentialsPOSTRequest, IClientCredentialsPOSTResponse, IRankingsGETResponse } from "../../types/osu/osu-api";
import { IRankingsCursor, IUserStatistics } from "../../types/osu/osu-structures";
import { sleep } from "../common";
import { HTTPStatus } from "../http";
import { LogSeverity, log } from "../log";

const OSU_API_OAUTH_ENDPOINT = "https://osu.ppy.sh/oauth/token";
const OSU_API_ENDPOINT = "https://osu.ppy.sh/api/v2";

export async function getAccessToken(clientId: number, clientSecret: string) {
	log("Access token requested.", "getAccessToken", LogSeverity.LOG);

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
			log(`API returned status ${ response.status }`, "getAccessToken", LogSeverity.WARN);
			log(`Response data:\n${ JSON.stringify(response.data) }`, "getAccessToken", LogSeverity.DEBUG);
		}

		log("Retrieved access token. Returning token as string.", "getAccessToken", LogSeverity.LOG);
		return !_.isUndefined(response.data.access_token) ? response.data.access_token : "";
	}
	catch (e) {
		if(axios.isAxiosError(e)) {
			if(!_.isUndefined(e.response)) {
				log(`API returned status ${ e.response.status }.`, "getAccessToken", LogSeverity.ERROR);
				log(`Response data:\n${ JSON.stringify(e.response.data) }`, "getAccessToken", LogSeverity.DEBUG);
			}
			else {
				log("API returned undefined status code.", "getAccessToken", LogSeverity.ERROR);
			}
		}
		else if(_.isError(e)) {
			log(`An error occurred while requesting osu! access token. Error details below.\n${ e.name }: ${ e.message }${ process.env.DEVELOPMENT === "1" ? `\n${ e.stack }` : "" }`, "getAccessToken", LogSeverity.ERROR);
		}
		else {
			log("Unknown error occurred while retrieving osu! access token.", "getAccessToken", LogSeverity.ERROR);
		}

		return "";
	}
}

export async function revokeAccessToken(token: string) {
	log("Access token revokation requested.", "revokeAccessToken", LogSeverity.LOG);

	try {
		const response = await axios.delete(`${ OSU_API_ENDPOINT }/oauth/tokens/current`, {
			headers: {
				Authorization: `Bearer ${ token }`
			}
		});

		if(response.status !== HTTPStatus.NO_CONTENT) {
			log(`API returned status ${ response.status }`, "revokeAccessToken", LogSeverity.WARN);
			log(`Response data:\n${ JSON.stringify(response.data) }`, "revokeAccessToken", LogSeverity.DEBUG);
			return false;
		}

		return true;
	}
	catch (e) {
		if(axios.isAxiosError(e)) {
			if(!_.isUndefined(e.response)) {
				log(`API returned status ${ e.response.status }.`, "revokeAccessToken", LogSeverity.ERROR);
				log(`Response data:\n${ JSON.stringify(e.response.data) }`, "revokeAccessToken", LogSeverity.DEBUG);
			}
			else {
				log("API returned undefined status code.", "revokeAccessToken", LogSeverity.ERROR);
			}
		}
		else if(_.isError(e)) {
			log(`An error occurred while revoking osu! access token. Error details below.\n${ e.name }: ${ e.message }${ process.env.DEVELOPMENT === "1" ? `\n${ e.stack }` : "" }`, "getAccessToken", LogSeverity.ERROR);
		}
		else {
			log("Unknown error occurred while revoking osu! access token.", "getAccessToken", LogSeverity.ERROR);
		}

		return false;
	}
}

export async function getScoreRanking(clientId: number, clientSecret: string) {
	try {
		let loop = true;
		let page = 1;

		let ret: IUserStatistics[] = [];

		let accessToken = await getAccessToken(clientId, clientSecret);

		do {
			process.stdout.write(`[LOG] getScoreRanking :: Requesting rankings (page: ${ page })...`);

			/* looping depends on cursor from its response */
			// eslint-disable-next-line no-await-in-loop
			const response = await axios.get<IRankingsGETResponse<IRankingsCursor>>(`${ OSU_API_ENDPOINT }/rankings/osu/score?page=${ page }`, {
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${ accessToken }`
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
					process.stdout.write("\n");

					/* revoking access token requires await, but it's okay since looping here is intended */
					// eslint-disable-next-line no-await-in-loop
					await revokeAccessToken(accessToken);
					loop = false;
				}
			}
			else if(response.status === HTTPStatus.UNAUTHORIZED) {
				process.stdout.write("[WARN] getScoreRanking :: Token expired or invalid. Requesting access token...");

				/* acquiring access token requires await */
				// eslint-disable-next-line no-await-in-loop
				accessToken = await getAccessToken(clientId, clientSecret);
			}
			else {
				process.stdout.write(`[WARN] getScoreRanking :: API returned status ${ response.status }.\n`);
				process.stdout.write(`[DEBUG] getScoreRanking :: Response data:\n${ JSON.stringify(response.data) }\n`);
				return null;
			}
		}
		while(loop);

		return ret;
	}
	catch (e) {
		if(axios.isAxiosError(e)) {
			if(!_.isUndefined(e.response)) {
				log(`API returned status ${ e.response.status }.`, "getScoreRanking", LogSeverity.ERROR);
				log(`Response data:\n${ e.response.data }`, "getScoreRanking", LogSeverity.DEBUG);
			}
			else {
				log("API returned undefined status code.", "getScoreRanking", LogSeverity.ERROR);
			}
		}
		else if(_.isError(e)) {
			log(`An error occurred while retrieving score data. Error details below.\n${ e.name }: ${ e.message }${ process.env.DEVELOPMENT === "1" ? `\n${ e.stack }` : "" }`, "getAccessToken", LogSeverity.ERROR);
		}
		else {
			log("Unknown error occurred while retrieving score data.", "getAccessToken", LogSeverity.ERROR);
		}

		return null;
	}
}
