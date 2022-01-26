import env from "dotenv";
import _ from "lodash";
import fs from "fs";
import { getAccessToken, getScoreRanking, revokeAccessToken } from "./utils/osu-api/osu";
import { LogLevel, log } from "./utils/log";
import { checkNumber } from "./utils/common";

env.config();

async function fetchData() {
	log("Checking for environment variables...");
	if(_.isUndefined(process.env.OSU_CLIENT_ID) || _.isUndefined(process.env.OSU_CLIENT_SECRET)) {
		log("OSU_CLIENT_ID or OSU_CLIENT_SECRET must not be empty. Exiting.", LogLevel.ERROR);
		return;
	}

	const clientId = _.parseInt(process.env.OSU_CLIENT_ID, 10);
	if(!checkNumber(clientId)) {
		log("OSU_CLIENT_ID must be number. Exiting.", LogLevel.ERROR);
		return;
	}

	log("Retrieving access token...");
	const token = await getAccessToken(clientId, process.env.OSU_CLIENT_SECRET);

	log(`Access token: ${ token }`, LogLevel.DEBUG);

	const rankings = await getScoreRanking(token);

	if(_.isNull(rankings)) {
		log("Failed to retrieve rankings. Exiting.", LogLevel.ERROR);
	}
	else {
		try {
			if(!fs.existsSync("./dist")) {
				fs.mkdirSync("./dist");
			}
			fs.writeFileSync("./dist/rankings.json", JSON.stringify(rankings, null, 2));
		}
		catch (e) {
			if(_.isError(e)) {
				log(`Error while writing file: ${ e.message }`, LogLevel.WARN);
			}
			else {
				log("Unknown error occurred.", LogLevel.WARN);
			}
		}
	}

	log("Revoking access token...");
	if(await revokeAccessToken(token)) {
		log("Access token revoked successfully.");
	}
	else {
		log("Unable to revoke access token.", LogLevel.WARN);
	}
}

fetchData();
