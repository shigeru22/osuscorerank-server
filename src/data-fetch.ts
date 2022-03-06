/* eslint-disable operator-linebreak */

import env from "dotenv";
import inquirer from "inquirer";
import fs from "fs";
import _ from "lodash";
import { getAccessToken, getScoreRanking, revokeAccessToken } from "./utils/osu-api/osu";
import { LogLevel, log } from "./utils/log";
import { checkNumber } from "./utils/common";
import { version } from "../package.json";

env.config();

function printHelp() {
	console.log("Usage: data-fetch [help] [fetch COUNTRY_CODE] [import]\n");
	console.log("If no arguments specified, will show UI menus for navigation.\n");
	console.log(
		"Optional arguments:\n" +
		"  help                Prints this help message and exit\n" +
		"  fetch COUNTRY_CODE  Fetch latest rankings from osu! API with country specified\n" +
		"                      in COUNTRY_CODE (2-letter code ISO 3166-1 Alpha-2 format)\n" +
		"                      to dist/rankings.json\n" +
		"  import              Imports data from dist/rankings.json to database"
	);
}

async function parseArguments() {
	if(_.findIndex(process.argv, item => item === "help") >= 0) {
		printHelp();
		process.exit();
	}

	const fetchIndex = _.findIndex(process.argv, item => item === "fetch");
	if(fetchIndex >= 0) {
		if(_.isUndefined(process.argv[fetchIndex + 1])) {
			console.log("No country code specified.");
			console.log("Usage: data-fetch fetch COUNTRY_CODE");
			console.log(
				"  COUNTRY_CODE must be a 2-letter code ISO 3166-1 Alpha-2 format.\n" +
				"  Listing could be found at:\n" +
				"  https://en.wikipedia.org/w/index.php?title=List_of_ISO_3166_country_codes#Current_ISO_3166_country_codes"
			);
		}
		else if(process.argv[fetchIndex + 1].length !== 2) {
			console.log("Country code must be a 2-letter code.");
		}
		else {
			await fetchApiData(process.argv[fetchIndex + 1]);
		}

		process.exit();
	}

	if(_.findIndex(process.argv, item => item === "import") >= 0) {
		await importData();
		process.exit();
	}
}

async function fetchApiData(countryCode: string) {
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

	const startTime = new Date();

	log("Retrieving rankings...");
	const rankings = await getScoreRanking(countryCode, token);

	if(_.isNull(rankings)) {
		log("Failed to retrieve rankings. Exiting.", LogLevel.ERROR);
	}
	else {
		try {
			console.log("Rankings retrieved successfully.");
			console.log("Writing to /dist/rankings.json...");

			const data = {
				[countryCode]: rankings
			};

			let temp = {};
			if(fs.existsSync("./dist/rankings.json")) {
				temp = JSON.parse(fs.readFileSync("./dist/rankings.json", "utf8"));
			}

			temp = Object.assign(temp, data);

			if(!fs.existsSync("./dist")) {
				fs.mkdirSync("./dist");
			}
			fs.writeFileSync("./dist/rankings.json", JSON.stringify(temp, null, 2));

			log("Rankings saved to /dist/rankings.json.");
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

	const endTime = new Date();

	log(`Country rankings fetched in ${ ((endTime.getTime() / 1000) - (startTime.getTime() / 1000)).toFixed(3) } seconds.`);
}

function importData() {
	console.log("Import data");
}

async function fetchLatestData() {
	/* linebreak rule disabled for code readibility purpose */

	console.log(
		"Please note: osu! API rate is limited. Although the rate is (nicely) high (about\n" +
		"1200 requests per minute), it's strongly advised to keep it slow to prevent\n" +
		"overusages. This program will fetch a single request every second.\n" +
		"Rankings from the API are limited up to 200 pages, with total of 10000 users\n" +
		"that would would be fetched.\n" +
		"Also note that the API has no total count in its Cursor object, no progress will\n" +
		"be shown other than how many data has been processed, so be patient."
	);

	const ansContinue = await inquirer.prompt({
		type: "confirm",
		name: "continue",
		message: "Continue?",
		default: false
	});

	if(!ansContinue.continue) {
		return;
	}

	const ansCountry = await inquirer.prompt({
		type: "input",
		name: "countryCode",
		message: "Enter country code: ",
		validate: (inp) => {
			const temp = inp as string;
			if(temp.length !== 2) {
				console.log(
					"\nCountry code must be in 2-letter code ISO 3166-1 Alpha-2 format.\n" +
					"Listing could be found at:\n" +
					"https://en.wikipedia.org/w/index.php?title=List_of_ISO_3166_country_codes#Current_ISO_3166_country_codes"
				);
				return false;
			}
			return true;
		}
	});

	await fetchApiData(ansCountry.countryCode);
}

async function main() {
	const menus = [
		"Fetch data from osu! API",
		"Import dist/rankings.json to database",
		"Command-line syntax",
		"Exit"
	];

	try {
		await parseArguments();

		console.clear();

		console.log(`Fetcher Utility (osuinactive-api ${ version })`);

		const answer = await inquirer.prompt([
			{
				type: "list",
				name: "selection",
				message: "Select an option:",
				choices: menus
			}
		]);

		const inp = _.findIndex(menus, item => _.isEqual(item, answer.selection));

		switch(inp) {
			case 0: await fetchLatestData(); break;
			case 1: await importData(); break;
			case 2: printHelp(); break;
			case 3: break;
		}

		process.exit(0);
	}
	catch (e) {
		if(_.isError(e)) {
			log(`Error occurred.\n${ e.name }: ${ e.message }`, LogLevel.ERROR);
		}
		else {
			log("Unknown error occurred. Exiting...", LogLevel.ERROR);
		}

		process.exit(1);
	}
}

main();
