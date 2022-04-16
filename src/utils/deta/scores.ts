import _ from "lodash";
import Deta from "deta/dist/types/deta";
import { IScoreData, IScoreDetailData, IScorePOSTData } from "../../types/score";
import { getUserByKey } from "./users";
import { LogLevel, log } from "../log";
import { getCountryByKey } from "./countries";

const DB_NAME = "osu-scores";

export async function getScores(deta: Deta, sort: "id" | "score" | "pp" | "date" = "score") {
	const db = deta.Base(DB_NAME);

	try {
		const fetchResult = (await db.fetch()).items as unknown as IScoreDetailData[];
		if(sort === "id") {
			fetchResult.sort((a, b) => {
				const idA = _.parseInt(a.key, 10);
				const idB = _.parseInt(b.key, 10);

				return idA - idB;
			});
		}
		else if(sort === "score") {
			fetchResult.sort((a, b) => {
				/* this might hit more than Number.MAX_SAFE_INTEGER value, but usable for now */

				const scoreA = _.isString(a.score) ? _.parseInt(a.score) : _.isNumber(a.score) ? a.score : Number(a.score);
				const scoreB = _.isString(b.score) ? _.parseInt(b.score) : _.isNumber(b.score) ? b.score : Number(b.score);

				return scoreA - scoreB;
			});
		}
		else if(sort === "pp") {
			fetchResult.sort((a, b) => a.pp - b.pp);
		}
		else {
			fetchResult.sort((a, b) => {
				const dateA: Date = typeof(a.dateAdded) === "string" ? new Date(a.dateAdded) : a.dateAdded;
				const dateB: Date = typeof(b.dateAdded) === "string" ? new Date(b.dateAdded) : b.dateAdded;

				return dateA.getTime() - dateB.getTime();
			});
		}

		return fetchResult;
	}
	catch (e) {
		if(_.isError(e)) {
			log(`getScores :: ${ e.name }: ${ e.message }\n${ e.stack }`, LogLevel.ERROR);
		}
		else {
			log("getScores :: Unknown error occurred.", LogLevel.ERROR);
		}

		return [];
	}
}

export async function getScoresByCountryId(deta: Deta, id: number, sort: "id" | "date" = "id") {
	const db = deta.Base(DB_NAME);

	try {
		const fetchResult = (await db.fetch({ user: { country: { countryId: id } } })).items as unknown as IScoreDetailData[];
		if(sort === "date") {
			fetchResult.sort((a, b) => {
				const dateA: Date = typeof(a.dateAdded) === "string" ? new Date(a.dateAdded) : a.dateAdded;
				const dateB: Date = typeof(b.dateAdded) === "string" ? new Date(b.dateAdded) : b.dateAdded;

				return dateA.getTime() - dateB.getTime();
			});
		}
		else {
			fetchResult.sort((a, b) => {
				const keyA = parseInt(a.key, 10);
				const keyB = parseInt(b.key, 10);

				return keyA - keyB;
			});
		}

		return fetchResult;
	}
	catch (e) {
		if(_.isError(e)) {
			log(`getScores :: ${ e.name }: ${ e.message }\n${ e.stack }`, LogLevel.ERROR);
		}
		else {
			log("getScores :: Unknown error occurred.", LogLevel.ERROR);
		}

		return [];
	}
}

export async function getScoreByKey(deta: Deta, key: number) {
	const db = deta.Base(DB_NAME);

	try {
		const fetchResult = (await db.get(key.toString())) as unknown as IScoreDetailData;
		return fetchResult;
	}
	catch (e) {
		if(_.isError(e)) {
			log(`getScoreByKey :: ${ e.name }: ${ e.message }\n${ e.stack }`, LogLevel.ERROR);
		}
		else {
			log("getScoreByKey :: Unknown error occurred.", LogLevel.ERROR);
		}

		return null;
	}
}

export async function getScoreByUserId(deta: Deta, id: number) {
	const db = deta.Base(DB_NAME);

	try {
		const fetchResult = (await db.fetch({ user: { userId: id.toString() } })) as unknown as IScoreDetailData[];
		if(fetchResult.length <= 0) {
			return null;
		}
		else if(fetchResult.length > 1) {
			log(`getScoreByUserId :: Queried ${ id } with more than 1 rows. Fix the repeating occurences and try again.`, LogLevel.ERROR);
			return null;
		}

		return fetchResult[0];
	}
	catch (e) {
		if(_.isError(e)) {
			log(`getScoreByUserId :: ${ e.name }: ${ e.message }\n${ e.stack }`, LogLevel.ERROR);
		}
		else {
			log("getScoreByUserId :: Unknown error occurred.", LogLevel.ERROR);
		}

		return null;
	}
}

export async function getScoreByOsuId(deta: Deta, id: number) {
	const db = deta.Base(DB_NAME);

	try {
		const fetchResult = (await db.fetch({ osuId: id.toString() })) as unknown as IScoreDetailData[];
		if(fetchResult.length <= 0) {
			return null;
		}
		else if(fetchResult.length > 1) {
			log(`getScoreByOsuId :: Queried ${ id } with more than 1 rows. Fix the repeating occurences and try again.`, LogLevel.ERROR);
			return null;
		}

		return fetchResult[0];
	}
	catch (e) {
		if(_.isError(e)) {
			log(`getScoreByOsuId :: ${ e.name }: ${ e.message }\n${ e.stack }`, LogLevel.ERROR);
		}
		else {
			log("getScoreByOsuId :: Unknown error occurred.", LogLevel.ERROR);
		}

		return null;
	}
}

export async function insertScore(deta: Deta, score: IScorePOSTData, silent = false) {
	const db = deta.Base(DB_NAME);

	try {
		const user = await getUserByKey(deta, score.userId);
		if(_.isNull(user)) {
			log("insertScore :: User not found.", LogLevel.ERROR);
			return false;
		}

		let currentLastId = 0;
		{
			const rows = await getScores(deta, "id");
			if(rows.length > 0) {
				currentLastId = _.parseInt(rows[rows.length - 1].key, 10);
			}
		}

		const data: IScoreData = {
			user: {
				userId: _.parseInt(user.key, 10),
				userName: user.userName,
				osuId: user.osuId,
				country: user.country
			},
			score: score.score,
			pp: score.pp
		};

		const date = new Date();

		await db.put({
			user: data.user,
			score: data.score.toString(),
			pp: data.pp,
			dateAdded: date.toISOString()
		}, (currentLastId + 1).toString());

		if(!silent) {
			log(`insertScore :: ${ DB_NAME }: Deleted 1 row.`, LogLevel.LOG);
		}

		return true;
	}
	catch (e) {
		if(_.isError(e)) {
			log(`insertScore :: ${ e.name }: ${ e.message }\n${ e.stack }`, LogLevel.ERROR);
		}
		else {
			log("insertScore :: Unknown error occurred.", LogLevel.ERROR);
		}

		return false;
	}
}

export async function updateScore(deta: Deta, score: IScorePOSTData, silent = false) {
	const db = deta.Base(DB_NAME);

	try {
		const fetchedScore = await getScoreByUserId(deta, score.userId);
		if(_.isNull(fetchedScore)) {
			log("updateScore :: Null score returned. See above log (if any) for details.", LogLevel.ERROR);
			return false;
		}

		const fetchedUser = await getUserByKey(deta, score.userId);
		if(_.isNull(fetchedUser)) {
			log("updateScore :: Null user returned.", LogLevel.ERROR);
			return false;
		}

		const fetchedCountry = await getCountryByKey(deta, fetchedUser.country.countryId);
		if(_.isNull(fetchedCountry)) {
			log("updateScore :: Null country returned.", LogLevel.ERROR);
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
			score: score.score,
			pp: score.pp
		}, fetchedScore.key);

		if(!silent) {
			log(`updateScore :: ${ DB_NAME }: Updated 1 row.`, LogLevel.LOG);
		}

		return true;
	}
	catch (e) {
		if(_.isError(e)) {
			log(`updateScore :: ${ e.name }: ${ e.message }\n${ e.stack }`, LogLevel.ERROR);
		}
		else {
			log("updateScore :: Unknown error occurred.", LogLevel.ERROR);
		}

		return false;
	}
}

export async function removeScore(deta: Deta, key: number, silent = false) {
	const db = deta.Base(DB_NAME);

	try {
		await db.delete(key.toString());

		if(!silent) {
			log(`removeScore :: ${ DB_NAME }: Deleted 1 row.`, LogLevel.LOG);
		}

		return true;
	}
	catch (e) {
		if(_.isError(e)) {
			log(`removeUser :: ${ e.name }: ${ e.message }\n${ e.stack }`, LogLevel.ERROR);
		}
		else {
			log("removeScore :: Unknown error occurred.", LogLevel.ERROR);
		}

		return false;
	}
}