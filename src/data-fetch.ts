import env from "dotenv";
import _ from "lodash";
import { getAccessToken } from "./utils/osu";
import { checkNumber } from "./utils/common";

env.config();

async function fetchData() {
	console.log("[INFO] Checking for environment variables...");
	if(_.isUndefined(process.env.OSU_CLIENT_ID) || _.isUndefined(process.env.OSU_CLIENT_SECRET)) {
		console.log(process.env.OSU_CLIENT_SECRET);
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
}

fetchData();
