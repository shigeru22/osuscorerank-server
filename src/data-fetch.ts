import env from "dotenv";
import _ from "lodash";
import fs from "fs";
import { getAccessToken, getScoreRanking, revokeAccessToken } from "./utils/osu-api/osu";
import { checkNumber } from "./utils/common";

env.config();

async function fetchData() {
	console.log("[INFO] Checking for environment variables...");
	if(_.isUndefined(process.env.OSU_CLIENT_ID) || _.isUndefined(process.env.OSU_CLIENT_SECRET)) {
		console.log("[ERROR] OSU_CLIENT_ID or OSU_CLIENT_SECRET must not be empty. Exiting.");
		return;
	}

	const clientId = _.parseInt(process.env.OSU_CLIENT_ID, 10);
	if(!checkNumber(clientId)) {
		console.log("[ERROR] OSU_CLIENT_ID must be number. Exiting.");
		return;
	}

	console.log("[INFO] Retrieving access token...");
	const token = await getAccessToken(clientId, process.env.OSU_CLIENT_SECRET);

	console.log(`[DEBUG] Access token: ${ token }`);

	const rankings = await getScoreRanking(token);

	if(_.isNull(rankings)) {
		console.log("[ERROR] Failed to retrieve rankings. Exiting.");
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
				console.log(`[DEBUG] Error while writing file: ${ e.message }` );
			}
			else {
				console.log("[DEBUG] Unknown error occurred.");
			}
		}
	}

	console.log("[INFO] Revoking access token...");
	if(await revokeAccessToken(token)) {
		console.log("[INFO] Access token revoked successfully.");
	}
	else {
		console.log("[WARN] Unable to revoke access token.");
	}
}

fetchData();
