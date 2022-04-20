import _ from "lodash";
import Deta from "deta/dist/types/deta";
import { IScoreDetailData } from "../../types/deta/score";
import { IScoreCountryData, IScorePOSTData } from "../../types/score";
import { getCountryByKey } from "./countries";
import { getUserByKey } from "./users";
import { LogSeverity, log } from "../log";
import { getUpdateByKey, getUpdatesByStatus } from "./updates";

const DB_NAME = "osu-scores";

export async function getScores(deta: Deta, active: boolean | null = null, sort: "id" | "score" | "pp" | "date" = "score", desc = false) {
	const db = deta.Base(DB_NAME);

	try {
		const fetchResult = (_.isNull(active) ? (await db.fetch()) : await db.fetch({ isActive: active })).items as unknown as IScoreDetailData[];

		if(fetchResult.length <= 0) {
			log(`${ DB_NAME }: No data returned from database.`, "getScores", LogSeverity.WARN);
		}
		else {
			log(`${ DB_NAME }: Returned ${ fetchResult.length } row${ fetchResult.length !== 1 ? "s" : "" }.`, "getScores", LogSeverity.LOG);
		}

		return sortScores(fetchResult, sort, desc);
	}
	catch (e) {
		if(_.isError(e)) {
			log(`An error occurred while querying database. Error details below.\n${ e.name }: ${ e.message }${ process.env.DEVELOPMENT === "1" ? `\n${ e.stack }` : "" }`, "getScores", LogSeverity.ERROR);
		}
		else {
			log("Unknown error occurred while querying database.", "getScores", LogSeverity.ERROR);
		}

		return [];
	}
}

export async function getScoresByCountryId(deta: Deta, active: boolean | null = null, countryId: number, updateId?: number, sort: "id" | "score" | "pp" | "date" = "score", desc = false) {
	const db = deta.Base(DB_NAME);

	try {
		let updateKey = 0;
		{
			if(_.isUndefined(updateId)) { // if id is undefined, return key of the latest online update
				const updateResult = await getUpdatesByStatus(deta, true, "id", desc);
				if(updateResult.length <= 0) {
					log("No update data in finalized status. Cancelling score data retrieval.", "getScoresByUpdateId", LogSeverity.ERROR);
					return [];
				}

				updateKey = _.parseInt(updateResult[0].key, 10);
			}
			else {
				if(updateId <= 0) {
					log("Invalid update ID parameter. Cancelling score data retrieval.", "getScoresByUpdateId", LogSeverity.ERROR);
					return [];
				}

				updateKey = updateId;
			}
		}

		{
			const country = await getCountryByKey(deta, countryId);
			if(_.isNull(country)) {
				log("Country not found. Cancelling score data retrieval.", "getScoresByCountryId", LogSeverity.WARN);
				return [];
			}
		}

		const fetchResult = (_.isNull(active) ? (await db.fetch({ countryId: countryId, updateId: updateKey })) : await db.fetch({ countryId: countryId, updateId: updateKey, isActive: active })).items as unknown as IScoreDetailData[];

		if(fetchResult.length <= 0) {
			log(`${ DB_NAME }: No data returned from database.`, "getScoresByCountryId", LogSeverity.WARN);
			return [];
		}

		log(`${ DB_NAME }: Returned ${ fetchResult.length } row${ fetchResult.length !== 1 ? "s" : "" }.`, "getScoresByCountryId", LogSeverity.LOG);
		return sortScores(fetchResult, sort, desc);
	}
	catch (e) {
		if(_.isError(e)) {
			log(`An error occurred while querying database. Error details below.\n${ e.name }: ${ e.message }${ process.env.DEVELOPMENT === "1" ? `\n${ e.stack }` : "" }`, "getScoresByCountryId", LogSeverity.ERROR);
		}
		else {
			log("Unknown error occurred while querying database.", "getScoresByCountryId", LogSeverity.ERROR);
		}

		return [];
	}
}

export async function getScoresByUpdateId(deta: Deta, active: boolean | null = null, id?: number, sort: "id" | "score" | "pp" | "date" = "score", desc = false) {
	const db = deta.Base(DB_NAME);

	try {
		let updateKey = 0;
		{
			if(_.isUndefined(id)) { // if id is undefined, return key of the latest online update
				const updateResult = await getUpdatesByStatus(deta, true, "id", true);
				if(updateResult.length <= 0) {
					log("No update data in finalized status. Cancelling score data retrieval.", "getScoresByUpdateId", LogSeverity.ERROR);
					return false;
				}

				updateKey = _.parseInt(updateResult[0].key, 10);
			}
			else {
				if(id <= 0) {
					log("Invalid update ID parameter. Cancelling score data retrieval.", "getScoresByUpdateId", LogSeverity.ERROR);
					return false;
				}

				updateKey = id;
			}
		}

		const fetchResult = (_.isNull(active) ? (await db.fetch({ updateId: updateKey })) : await db.fetch({ updateId: updateKey, isActive: active })).items as unknown as IScoreDetailData[];

		if(fetchResult.length <= 0) {
			log(`${ DB_NAME }: No data returned from database.`, "getScoresByUpdateId", LogSeverity.WARN);
			return [];
		}

		log(`${ DB_NAME }: Returned ${ fetchResult.length } row${ fetchResult.length !== 1 ? "s" : "" }.`, "getScoresByUpdateId", LogSeverity.LOG);
		return sortScores(fetchResult, sort, desc);
	}
	catch (e) {
		if(_.isError(e)) {
			log(`An error occurred while querying database. Error details below.\n${ e.name }: ${ e.message }${ process.env.DEVELOPMENT === "1" ? `\n${ e.stack }` : "" }`, "getScoresByUpdateId", LogSeverity.ERROR);
		}
		else {
			log("Unknown error occurred while querying database.", "getScoresByUpdateId", LogSeverity.ERROR);
		}

		return [];
	}
}

export async function getScoreByKey(deta: Deta, key: number) {
	const db = deta.Base(DB_NAME);

	try {
		const fetchResult = (await db.get(key.toString())) as unknown as IScoreDetailData;

		if(_.isNull(fetchResult)) {
			log(`${ DB_NAME }: No data returned from database.`, "getScoreByKey", LogSeverity.WARN);
		}
		else {
			log(`${ DB_NAME }: Returned 1 row.`, "getScoreByKey", LogSeverity.LOG);
		}

		return fetchResult;
	}
	catch (e) {
		if(_.isError(e)) {
			log(`An error occurred while querying database. Error details below.\n${ e.name }: ${ e.message }${ process.env.DEVELOPMENT === "1" ? `\n${ e.stack }` : "" }`, "getScoreByKey", LogSeverity.ERROR);
		}
		else {
			log("Unknown error occurred while querying database.", "getScoreByKey", LogSeverity.ERROR);
		}

		return null;
	}
}

export async function getScoreByUserId(deta: Deta, id: number, updateId?: number) {
	const db = deta.Base(DB_NAME);

	try {
		let updateKey: number | null = null;
		{
			if(_.isUndefined(updateId)) { // if id is undefined, return key of the latest online update
				const updateResult = await getUpdatesByStatus(deta, true, "id", true);
				if(updateResult.length <= 0) {
					log("No update data in finalized status. Cancelling score data retrieval.", "getScoreByUserId", LogSeverity.ERROR);
					return null;
				}

				updateKey = _.parseInt(updateResult[0].key, 10);
			}
			else {
				if(updateId <= 0) {
					log("Invalid update ID parameter. Cancelling score data retrieval.", "getScoreByUserId", LogSeverity.ERROR);
					return null;
				}

				updateKey = updateId;
			}
		}

		{
			const user = await getUserByKey(deta, id);
			if(_.isNull(user)) {
				log("Null user returned. See above log (if any) for details.", "getScoreByUserId", LogSeverity.WARN);
				return null;
			}
		}

		const fetchResult = (await db.fetch({ userId: id, updateId: updateKey })).items as unknown as IScoreDetailData[];
		if(fetchResult.length <= 0) {
			log(`${ DB_NAME }: No data returned from database.`, "getScoreByUserId", LogSeverity.WARN);
			return null;
		}
		else if(fetchResult.length > 1) {
			log(`${ DB_NAME }: Queried ${ id } with more than 1 rows. Fix the repeating occurences and try again.`, "getScoreByUserId", LogSeverity.ERROR);
			return null;
		}

		log(`${ DB_NAME }: Returned 1 row.`, "getScoreByUserId", LogSeverity.LOG);
		return fetchResult[0];
	}
	catch (e) {
		if(_.isError(e)) {
			log(`An error occurred while querying database. Error details below.\n${ e.name }: ${ e.message }${ process.env.DEVELOPMENT === "1" ? `\n${ e.stack }` : "" }`, "getScoreByUserId", LogSeverity.ERROR);
		}
		else {
			log("Unknown error occurred while querying database.", "getScoreByUserId", LogSeverity.ERROR);
		}

		return null;
	}
}

export async function getScoreByOsuId(deta: Deta, id: number) {
	const db = deta.Base(DB_NAME);

	try {
		const fetchResult = (await db.fetch({ osuId: id.toString() })) as unknown as IScoreDetailData[];
		if(fetchResult.length <= 0) {
			log(`${ DB_NAME }: No data returned from database.`, "getScoreByOsuId", LogSeverity.WARN);
			return null;
		}
		else if(fetchResult.length > 1) {
			log(`${ DB_NAME }: Queried ${ id } with more than 1 rows. Fix the repeating occurences and try again.`, "getScoreByOsuId", LogSeverity.ERROR);
			return null;
		}

		log(`${ DB_NAME }: Returned 1 row.`, "getScoreByOsuId", LogSeverity.LOG);
		return fetchResult[0];
	}
	catch (e) {
		if(_.isError(e)) {
			log(`An error occurred while querying database. Error details below.\n${ e.name }: ${ e.message }${ process.env.DEVELOPMENT === "1" ? `\n${ e.stack }` : "" }`, "getScoreByOsuId", LogSeverity.ERROR);
		}
		else {
			log("Unknown error occurred while querying database.", "getScoreByOsuId", LogSeverity.ERROR);
		}

		return null;
	}
}

export async function insertScore(deta: Deta, score: IScorePOSTData, updateId?: number, silent = false) {
	const db = deta.Base(DB_NAME);

	try {
		const user = await getUserByKey(deta, score.userId);
		if(_.isNull(user)) {
			log("Null user returned. See above log (if any) for details.", "insertScore", LogSeverity.ERROR);
			return false;
		}

		let currentLastId = 0;
		{
			const rows = await getScores(deta, null, "id");
			if(rows.length > 0) {
				currentLastId = _.parseInt(rows[rows.length - 1].key, 10);
			}
		}

		let updateKey = 0;
		{
			if(!_.isUndefined(updateId)) {
				const updateResult = await getUpdateByKey(deta, updateId);
				if(_.isNull(updateResult)) {
					log("Null update data returned. See above log (if any) for details.", "insertScore", LogSeverity.ERROR);
					return false;
				}

				if(updateResult.online) {
					log("Update data already finalized. Cancelling score data insertion.", "insertScore", LogSeverity.ERROR);
					return false;
				}

				updateKey = updateId;
			}
			else {
				const updateResult = await getUpdatesByStatus(deta, false, "id", true);
				if(updateResult.length <= 0) {
					log("No update data in non-finalized status. Cancelling score data insertion.", "insertScore", LogSeverity.ERROR);
					return false;
				}

				updateKey = _.parseInt(updateResult[0].key, 10);
			}
		}

		const data: IScoreCountryData = {
			user: {
				userId: _.parseInt(user.key, 10),
				userName: user.userName,
				osuId: user.osuId,
				isActive: user.isActive,
				country: user.country
			},
			score: score.score,
			pp: score.pp
		};

		const date = new Date();

		await db.put({
			user: JSON.parse(JSON.stringify(data.user)),
			userId: data.user.userId,
			countryId: data.user.country.countryId,
			isActive: data.user.isActive,
			score: data.score.toString(),
			pp: data.pp,
			updateId: updateKey,
			dateAdded: date.toISOString()
		}, (currentLastId + 1).toString());

		if(!silent) {
			log(`${ DB_NAME }: Inserted 1 row.`, "insertScore", LogSeverity.LOG);
		}

		return true;
	}
	catch (e) {
		if(_.isError(e)) {
			log(`An error occurred while inserting data to database. Error details below.\n${ e.name }: ${ e.message }${ process.env.DEVELOPMENT === "1" ? `\n${ e.stack }` : "" }`, "insertScore", LogSeverity.ERROR);
		}
		else {
			log("Unknown error occurred while inserting data to database.", "insertScore", LogSeverity.ERROR);
		}

		return false;
	}
}

export async function updateScore(deta: Deta, score: IScorePOSTData, silent = false) {
	const db = deta.Base(DB_NAME);

	try {
		const fetchedScore = await getScoreByUserId(deta, score.userId);
		if(_.isNull(fetchedScore)) {
			log("Null score returned. See above log (if any) for details.", "updateScore", LogSeverity.WARN);
			return false;
		}

		const fetchedUser = await getUserByKey(deta, score.userId);
		if(_.isNull(fetchedUser)) {
			log("Null user returned. See above log (if any) for details.", "updateScore", LogSeverity.WARN);
			return false;
		}

		const fetchedCountry = await getCountryByKey(deta, fetchedUser.country.countryId);
		if(_.isNull(fetchedCountry)) {
			log("Null country returned. See above log (if any) for details.", "updateScore", LogSeverity.WARN);
			return false;
		}

		await db.update({
			user: {
				userId: score.userId,
				userName: fetchedUser.userName,
				osuId: fetchedUser.osuId,
				country: {
					countryId: fetchedUser.country.countryId,
					countryName: fetchedCountry.countryName,
					countryCode: fetchedCountry.countryCode
				}
			},
			isActive: fetchedUser.isActive,
			score: score.score,
			pp: score.pp
		}, fetchedScore.key);

		if(!silent) {
			log(`${ DB_NAME }: Updated 1 row.`, "updateScore", LogSeverity.LOG);
		}

		return true;
	}
	catch (e) {
		if(_.isError(e)) {
			log(`An error occurred while inserting data to database. Error details below.\n${ e.name }: ${ e.message }${ process.env.DEVELOPMENT === "1" ? `\n${ e.stack }` : "" }`, "updateScore", LogSeverity.ERROR);
		}
		else {
			log("Unknown error occurred while inserting data to database.", "updateScore", LogSeverity.ERROR);
		}

		return false;
	}
}

export async function removeScore(deta: Deta, key: number, silent = false) {
	const db = deta.Base(DB_NAME);

	try {
		await db.delete(key.toString());

		if(!silent) {
			log(`${ DB_NAME }: Removed 1 row.`, "removeScore", LogSeverity.LOG);
		}

		return true;
	}
	catch (e) {
		if(_.isError(e)) {
			log(`An error occurred while inserting data to database. Error details below.\n${ e.name }: ${ e.message }${ process.env.DEVELOPMENT === "1" ? `\n${ e.stack }` : "" }`, "removeScore", LogSeverity.ERROR);
		}
		else {
			log("Unknown error occurred while inserting data to database.", "removeScore", LogSeverity.ERROR);
		}

		return false;
	}
}

function sortScores(data: IScoreDetailData[], sort: "id" | "score" | "pp" | "date", desc = false) {
	const temp = [ ...data ];

	temp.sort((a, b) => {
		let compA = 0;
		let compB = 0;

		if(sort === "id") {
			compA = _.parseInt(a.key, 10);
			compB = _.parseInt(b.key, 10);
		}
		else if(sort === "score") {
			/* this might hit more than Number.MAX_SAFE_INTEGER value, but usable for now */

			compA = _.isString(a.score) ? _.parseInt(a.score) : _.isNumber(a.score) ? a.score : Number(a.score);
			compB = _.isString(b.score) ? _.parseInt(b.score) : _.isNumber(b.score) ? b.score : Number(b.score);
		}
		else if(sort === "pp") {
			compA = a.pp;
			compB = b.pp;
		}
		else {
			compA = (typeof(a.dateAdded) === "string" ? new Date(a.dateAdded) : a.dateAdded).getTime();
			compB = (typeof(b.dateAdded) === "string" ? new Date(b.dateAdded) : b.dateAdded).getTime();
		}

		return desc ? compB - compA : compA - compB;
	});

	return [ ...temp ];
}
