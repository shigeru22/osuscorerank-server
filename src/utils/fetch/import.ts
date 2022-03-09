import fs from "fs";
import _ from "lodash";
import { log, LogLevel } from "../log";
import { getCountryByCode } from "../prisma/countries";
import { getUserByOsuId, getUsers, insertUser, removeUser, updateUser } from "../prisma/users";
import { ICountry } from "../../types/prisma/country";
import { IUserStatistics } from "../../types/osu/osu-structures";
import { IUser } from "../../types/prisma/user";
import { IUserScoreData } from "../../types/user";
import { getScores, insertScore, updateScore } from "../prisma/scores";

export async function importDataFromFile(path: string) {
	if(!fs.existsSync(path)) {
		log(`${ path } is not yet generated.`, LogLevel.ERROR);
		console.log("\nFetch the data first using:\n  data-fetch fetch COUNTRY_CODE\nor use data-fetch (without arguments) for guidance.\n");
		process.exit(1);
	}

	console.log(`Importing data from ${ path }.`);
	const data = JSON.parse(fs.readFileSync(path, "utf8"));

	/* process by country ids */
	const countriesRequestData: Promise<ICountry | null>[] = [];
	const countryCodes: string[] = [];

	/* get country codes */
	for(const prop in data) {
		countriesRequestData.push(getCountryByCode(prop));
		countryCodes.push(prop);
	}

	console.log("Requesting country data...");
	const countries = await Promise.all(countriesRequestData);

	/* populate users */
	const users: IUserScoreData[] = [];
	const activeUsers: IUserScoreData[] = [];

	for(const prop in data) {
		const stats: IUserStatistics[] = data[prop];
		stats.forEach(stat => {
			const country = countries[_.findIndex(countryCodes, code => code.toLowerCase() === stat.user.country_code.toLowerCase())];

			if(!_.isNull(country)) { // TODO: handle not found country changes
				if(!stat.user.is_active) {
					users.push({
						userName: stat.user.username,
						osuId: stat.user.id,
						countryId: country.countryId,
						score: stat.total_score,
						pp: stat.pp,
						globalRank: stat.global_rank
					});
				}
				else {
					activeUsers.push({
						userName: stat.user.username,
						osuId: stat.user.id,
						countryId: country.countryId,
						score: stat.total_score,
						pp: stat.pp,
						globalRank: stat.global_rank
					});
				}
			}
		});
	}

	if(users.length <= 0) {
		console.log("Nothing to process. Exiting...");
		process.exit(0);
	}

	await insertOrUpdateUsers(users);
	await deleteUsers(activeUsers);
	await updateScores(users);

	console.log("Import task completed successfully.");
}

async function insertOrUpdateUsers(users: IUserScoreData[]) {
	console.log("Manipulating user data. Please wait.");

	const userRequestData: Promise<IUser | null>[] = [];
	users.forEach(user => {
		userRequestData.push(getUserByOsuId(user.osuId));
	});

	const userData = await Promise.all(userRequestData);

	const insertUserRequestData: Promise<number>[] = [];
	const updateUserRequestData: Promise<number>[] = [];

	users.forEach((user, index) => {
		process.stdout.write(`Determining users to insert or update (${ index + 1 } / ${ users.length })...`);

		if(_.isNull(userData[index])) {
			/* TODO: increase inactive count for that country */
			insertUserRequestData.push(insertUser([ {
				userName: user.userName,
				osuId: user.osuId,
				countryId: user.countryId
			} ], true));
		}
		else {
			updateUserRequestData.push(updateUser({
				userName: user.userName,
				osuId: user.osuId,
				countryId: user.countryId
			}, true));
		}

		process.stdout.clearLine(0);
		process.stdout.cursorTo(0);
	});

	console.log("Running query transactions...");

	const insertResults = await Promise.all(insertUserRequestData);
	insertResults.forEach(res => {
		if(res === 0) {
			console.log("An error occurred while inserting user. Exiting...");
			process.exit(1);
		}
	});

	const updateResults = await Promise.all(updateUserRequestData);
	updateResults.forEach(res => {
		if(res === 0) {
			console.log("An error occurred while updating user. Exiting...");
			process.exit(1);
		}
	});

	console.log("Data insert and update complete.");
}

async function deleteUsers(users: IUserScoreData[]) {
	console.log("Checking for active users. Please wait.");

	const currentUsers = await getUsers();
	const activeOsuIds: number[] = [];

	users.forEach((user, index) => {
		process.stdout.write(`Determining active users (${ index + 1 }/${ users.length })...`);

		const dbUserId = _.findIndex(currentUsers, current => current.osuId === user.osuId);
		if(dbUserId >= 0) {
			activeOsuIds.push(user.osuId);
		}

		process.stdout.clearLine(0);
		process.stdout.cursorTo(0);
	});

	const activeUserIdsRequestData: Promise<IUser | null>[] = [];
	activeOsuIds.forEach(id => {
		activeUserIdsRequestData.push(getUserByOsuId(id));
	});

	console.log("Retrieving active user data...");

	const activeUsers = await Promise.all(activeUserIdsRequestData);

	console.log("Deleting active user data...");

	const deleteUserRequestData: Promise<number>[] = [];
	activeUsers.forEach(user => {
		if(!_.isNull(user)) {
			deleteUserRequestData.push(removeUser(user.userId, true));
		}
	});

	const deleteUserResults = await Promise.all(deleteUserRequestData);

	deleteUserResults.forEach(res => {
		if(res === 0) {
			console.log("An error occurred while deleting user. Exiting...");
			process.exit(1);
		}
	});

	console.log("Active user deletion complete.");
}

async function updateScores(users: IUserScoreData[]) {
	console.log("Determining scores to insert or update. This will take some time.");

	const scoreRankings = await getScores(1);
	const ppRankings = await getScores(2);
	const userData = await getUsers();

	const insertScoreRequestData: Promise<number>[] = [];
	const updateScoreRequestData: Promise<number>[] = [];

	users.forEach((user, index) => {
		process.stdout.write(`Processing user (${ index + 1 }/${ users.length })...`);

		const userIndex = _.findIndex(userData, data => data.osuId === user.osuId);

		const scoreIndex = _.findIndex(scoreRankings, score => score.user.osuId === user.osuId);
		const ppIndex = _.findIndex(ppRankings, score => score.user.osuId === user.osuId);

		if(scoreIndex >= 0) { // ppIndex is not needed since both should return the same number of rows
			const countryScoreRankings = scoreRankings.filter(row => row.user.country.countryId === user.countryId);
			const countryPpRankings = ppRankings.filter(row => row.user.country.countryId === user.countryId);

			updateScoreRequestData.push(updateScore({
				userId: userData[userIndex].userId,
				score: user.score,
				pp: _.parseInt(user.pp.toFixed(0), 10),
				globalRank: user.globalRank,
				previousPpRank: _.findIndex(countryPpRankings, row => row.user.osuId === user.osuId) + 1,
				previousScoreRank: _.findIndex(countryScoreRankings, row => row.user.osuId === user.osuId) + 1,
				previousGlobalPpRank: ppIndex,
				previousGlobalScoreRank: scoreIndex
			}, true));
		}
		else {
			insertScoreRequestData.push(insertScore([ {
				userId: userData[userIndex].userId,
				score: user.score,
				pp: _.parseInt(user.pp.toFixed(0), 10),
				globalRank: user.globalRank,
				previousPpRank: null,
				previousScoreRank: null,
				previousGlobalPpRank: null,
				previousGlobalScoreRank: null
			} ], true));
		}

		process.stdout.clearLine(0);
		process.stdout.cursorTo(0);
	});

	console.log("Running query transactions...");

	const insertResults = await Promise.all(insertScoreRequestData);
	insertResults.forEach(res => {
		if(res === 0) {
			console.log("An error occurred while inserting score. Exiting...");
			process.exit(1);
		}
	});

	const updateResults = await Promise.all(updateScoreRequestData);
	updateResults.forEach(res => {
		if(res === 0) {
			console.log("An error occurred while updating score. Exiting...");
			process.exit(1);
		}
	});

	console.log("Data insert and update complete.");
}
