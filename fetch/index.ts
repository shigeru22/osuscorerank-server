import dotenv from "dotenv";
import _ from "lodash";
import { getScoreRanking } from "../src/utils/osu-api/osu";
import { exportRankingsData } from "./fs";
import { envCheck } from "./env";
import { inputNumber, inputText } from "./input";

dotenv.config();

async function fetchApiData() {
	console.clear();

	if(!envCheck()) {
		process.exit(1);
	}

	console.log("Fetch data from osu! API\n");
	console.log("This will fetch data from osu! API and store the results to temp/rankings.json.");
	console.log("Note that normal usage for osu! API requests are 60 requests per minute, so be");
	console.log("patient. This operation may take around 5 minutes.\n");

	const input = await inputText("Continue? (y/N)", id => {
		if(id === "") return true;
		const tempId = id.toLowerCase();
		return (tempId === "y") || (tempId === "n");
	});

	switch(input) {
		case "": // fallthrough
		case "n":
			console.log("Exiting.");
			process.exit(0);
	}

	console.clear();

	const startTime = new Date();

	const clientId = _.parseInt(process.env.OSU_CLIENT_ID as string, 10);
	const ranking = await getScoreRanking(clientId, process.env.OSU_CLIENT_SECRET as string);

	if(_.isNull(ranking)) {
		console.log("[ERROR] fetchApiData :: Failed to retrieve rankings. Exiting.");
		process.exit(1);
	}

	console.log("[LOG] fetchApiData :: Data fetch complete. Exporting to dist/rankings.json...");

	if(!exportRankingsData(ranking, "dist/rankings.json")) {
		process.exit(1);
	}

	const endTime = new Date();

	console.log(`[LOG] fetchApiData :: Operation completed in ${ ((endTime.getTime() / 1000) - (startTime.getTime() / 1000)).toFixed(3) } seconds.`);
}

async function main() {
	console.clear();

	console.log("osu! Score Rank API Data Fetcher\n");
	console.log("  1. Fetch data from osu! API");
	console.log("  2. Import data from temp/rankings.json");
	console.log("  0. Exit\n");

	const input = await inputNumber("Input:", id => id >= 0 && id <= 2);
	switch(input) {
		case 0: process.exit(0); break;
		case 1: fetchApiData(); break;
	}
}

main();
