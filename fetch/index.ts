import dotenv from "dotenv";
import { Deta } from "deta";
import _ from "lodash";
import { envCheck, envDetaCheck } from "./env";
import { exportRankingsData, importRankingsData } from "./fs";
import { inputNumber, inputText } from "./input";
import { IUpdateDetailData } from "../src/types/deta/update";
import { IUserPOSTData, IUserPUTData } from "../src/types/user";
import { IScorePOSTData } from "../src/types/score";
import { getCountries, insertMultipleCountries } from "../src/utils/deta/countries";
import { getUsers, insertMultipleUsers, updateMultipleUsers } from "../src/utils/deta/users";
import { insertMultipleScores } from "../src/utils/deta/scores";
import { getUpdates, insertUpdate, updateOnlineStatus } from "../src/utils/deta/updates";
import { getScoreRanking } from "../src/utils/osu-api/osu";
import { CountryGetStatus, CountryInsertStatus, ScoreInsertStatus, UpdateGetStatus, UserGetStatus, UserInsertStatus, UserUpdateStatus } from "../src/utils/status";
import Config from "../config.json";
import { ICountryPOSTData } from "../src/types/country";
import { sleep } from "../src/utils/common";

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

	console.log("");
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

async function dataImport() {
	if(!envDetaCheck()) {
		process.exit(1);
	}

	console.clear();

	console.log("Data importer\n");
	console.log("This will import data retrieved from osu! API saved in dist/rankings.json.");
	console.log("The operation will import scores from countries specified in config.json located");
	console.log("at root project directory. This operation may some time depending on countries");
	console.log("added.");

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

	const startTime = new Date();

	{
		let strCountries = "";
		Config.countries.forEach((country, index) => {
			strCountries += country.code;
			if(index < Config.countries.length - 1) {
				strCountries += ",";
			}
		});

		console.log(`\n[LOG] dataImport :: Starting import with countries: ${ strCountries }`);
	}

	const rankings = importRankingsData("dist/rankings.json");
	if(_.isNull(rankings)) {
		console.log("[ERROR] dataImport :: Unable to read data from dist/rankings.json. Exiting.");
		console.log("[ERROR] dataImport :: Hint: Try fetching the data.");
		process.exit(1);
	}

	const deta = Deta(process.env.DETA_PROJECT_KEY as string);

	{
		/* 1. iterate current countries */

		console.log("[LOG] dataImport :: Fetching current countries...");

		const countryData = await getCountries(deta, "id", false, true);
		if(countryData === CountryGetStatus.INTERNAL_ERROR) {
			process.exit(1);
		}

		const insertCountriesData: ICountryPOSTData[] = [];

		const len = Config.countries.length;
		for(let i = 0; i < len; i++) {
			process.stdout.write(`[LOG] dataImport :: Processing countries (${ i + 1 }/${ len })...`);

			const countryIndex = countryData.findIndex(country => country.countryCode === Config.countries[i].code);
			if(countryIndex < 0) {
				insertCountriesData.push({
					countryName: Config.countries[i].name,
					countryCode: Config.countries[i].code
				});
			}

			if(i < len - 1) {
				process.stdout.clearLine(0);
				process.stdout.cursorTo(0);
			}
			else {
				process.stdout.write("\n");
			}
		}

		/* 3. insert missing countries */

		if(insertCountriesData.length > 0) {
			console.log("[LOG] dataImport :: Inserting new countries...");

			const res = await insertMultipleCountries(deta, insertCountriesData, false);
			if(res === CountryInsertStatus.INTERNAL_ERROR) {
				process.exit(1);
			}
		}
		else {
			if(countryData.length <= 0) {
				console.log("[ERROR] dataImport :: No country available in database. Exiting.");
				process.exit(1);
			}
		}
	}

	await sleep(3000); // wait for data flush

	/* 2. insert new update data */

	console.log("[LOG] dataImport :: Inserting new update data...");

	await insertUpdate(deta, { apiVersion: "1.0.0", webVersion: "1.0.0" }, true);
	let updateData: IUpdateDetailData;
	{
		const updatesData = await getUpdates(deta, "date", true);
		if(updatesData === UpdateGetStatus.INTERNAL_ERROR) {
			console.log("[ERROR] Unable to retrieve latest update after insertion. Exiting.");
			process.exit(1);
		}

		updateData = updatesData[0];
	}

	await sleep(3000); // wait for data flush

	{
		/* 4. fetch current data */

		console.log("[LOG] dataImport :: Fetching current data...");

		const countryData = await getCountries(deta, "id", false, true);
		if(countryData === CountryGetStatus.INTERNAL_ERROR) {
			process.exit(1);
		}

		const usersData = await getUsers(deta, null, "id", false, true);
		if(usersData === UserGetStatus.INTERNAL_ERROR) {
			process.exit(1);
		}

		/* 5. iterate all users */

		console.log("[LOG] dataImport :: Processing user data to insert or update. Please be patient.");

		const insertUsersData: IUserPOSTData[] = [];
		const updateUsersData: IUserPUTData[] = [];

		const len = rankings.length;
		for(let i = 0; i < len; i++) {
			process.stdout.write(`[LOG] dataImport :: Processing user data (${ i + 1 }/${ len })...`);

			const userIndex = usersData.findIndex(user => user.osuId === rankings[i].user.id);
			if(userIndex >= 0) {
				const countryIndex = countryData.findIndex(country => country.countryCode === rankings[i].user.country_code);
				if(countryIndex >= 0) {
					/* update user data as needed */

					if(rankings[i].user.country_code !== usersData[userIndex].country.countryCode || rankings[i].user.username !== usersData[userIndex].userName || rankings[i].user.is_active !== usersData[userIndex].isActive) {
						updateUsersData.push({
							userId: _.parseInt(usersData[userIndex].key, 10),
							countryId: _.parseInt(countryData[countryIndex].key, 10),
							isActive: rankings[i].user.is_active,
							userName: rankings[i].user.username
						});
					}
				}
			}
			else {
				const countryIndex = countryData.findIndex(country => country.countryCode === rankings[i].user.country_code);
				if(countryIndex >= 0) {
					insertUsersData.push({
						countryId: _.parseInt(countryData[countryIndex].key, 10),
						isActive: rankings[i].user.is_active,
						osuId: rankings[i].user.id,
						userName: rankings[i].user.username
					});
				}
			}

			if(i < len - 1) {
				process.stdout.clearLine(0);
				process.stdout.cursorTo(0);
			}
			else {
				process.stdout.write("\n");
			}
		}

		/* 6. insert and update users */

		console.log("[LOG] dataImport :: Inserting and updating users. Please be patient.");

		if(insertUsersData.length > 0) {
			const resInsert = await insertMultipleUsers(deta, insertUsersData, false);
			if(resInsert === UserInsertStatus.INTERNAL_ERROR) {
				process.exit(1);
			}
		}

		if(updateUsersData.length > 0) {
			const resUpdate = await updateMultipleUsers(deta, updateUsersData, false);
			if(resUpdate === UserUpdateStatus.INTERNAL_ERROR) {
				process.exit(1);
			}
		}
	}

	await sleep(3000); // wait for data flush

	{
		/* 7. iterate scores based on users */

		console.log("[LOG] dataImport :: Determining scores to be inserted. Please be patient.");

		const insertScoreData: IScorePOSTData[] = [];

		{
			console.log("[LOG] dataImport :: Retrieving latest data...");

			const countryData = await getCountries(deta);
			if(countryData === CountryGetStatus.INTERNAL_ERROR) {
				process.exit(1);
			}

			const usersData = await getUsers(deta);
			if(usersData === UserGetStatus.INTERNAL_ERROR) {
				process.exit(1);
			}

			const len = rankings.length;
			for(let i = 0; i < len; i++) {
				process.stdout.write(`[LOG] dataImport :: Processing user scores (${ i + 1 }/${ len })...`);

				const userIndex = usersData.findIndex(user => user.osuId === rankings[i].user.id);
				if(userIndex >= 0) {
					insertScoreData.push({
						userId: _.parseInt(usersData[userIndex].key, 10),
						score: rankings[i].ranked_score,
						pp: _.parseInt(rankings[i].pp.toFixed(0), 10)
					});
				}

				if(i < len - 1) {
					process.stdout.clearLine(0);
					process.stdout.cursorTo(0);
				}
				else {
					process.stdout.write("\n");
				}
			}
		}

		/* 8. insert scores data */

		console.log("[LOG] dataImport :: Inserting scores to latest update data. Please be patient.");

		if(insertScoreData.length > 0) {
			const res = await insertMultipleScores(deta, insertScoreData, _.parseInt(updateData.key, 10), false);
			if(res === ScoreInsertStatus.INTERNAL_ERROR) {
				process.exit(1);
			}
		}
	}

	await sleep(3000); // wait for data flush

	console.log("[LOG] dataImport :: Setting update data online status...");
	await updateOnlineStatus(deta, _.parseInt(updateData.key, 10), true, false);

	const endTime = new Date();

	console.log(`[LOG] dataImport :: Data import completed in ${ ((endTime.getTime() / 1000) - (startTime.getTime() / 1000)).toFixed(3) } seconds. Enjoy your day.`);
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
		case 1: await fetchApiData(); break;
		case 2: await dataImport(); break;
	}
}

main();
