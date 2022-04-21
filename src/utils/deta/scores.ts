import _ from "lodash";
import Deta from "deta/dist/types/deta";
import { IScoreDetailData } from "../../types/deta/score";
import { IScoreCountryData, IScorePOSTData } from "../../types/score";
import { CountryGetStatus, UserGetStatus, ScoreGetStatus, ScoreInsertStatus, ScoreUpdateStatus, ScoreDeleteStatus, UpdateGetStatus } from "../status";
import { getCountryByKey } from "./countries";
import { getUserByKey, getUserByOsuId } from "./users";
import { LogSeverity, log } from "../log";
import { getUpdateByKey, getUpdatesByStatus } from "./updates";

const DB_NAME = "osu-scores";

export async function getScores(deta: Deta, active: boolean | null = null, sort: "id" | "score" | "pp" | "date" = "score", desc = false): Promise<IScoreDetailData[] | ScoreGetStatus.INTERNAL_ERROR> {
	const db = deta.Base(DB_NAME);

	try {
		let query = {};
		if(!_.isNull(active)) {
			query = Object.assign(query, { isActive: active });
		}

		const fetchResult = (await db.fetch(query)).items as unknown as IScoreDetailData[];

		if(fetchResult.length <= 0) {
			log(`${ DB_NAME }: No data returned from database.`, "getScores", LogSeverity.WARN);
			return [];
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

		return ScoreGetStatus.INTERNAL_ERROR;
	}
}

export async function getScoresByCountryId(deta: Deta, active: boolean | null = null, countryId: number, updateId?: number, sort: "id" | "score" | "pp" | "date" = "score", desc = false): Promise<IScoreDetailData[] | ScoreGetStatus.NO_ONLINE_UPDATE_DATA | ScoreGetStatus.INVALID_UPDATE_ID | ScoreGetStatus.INTERNAL_ERROR> {
	const db = deta.Base(DB_NAME);

	try {
		let updateKey = 0;
		{
			if(_.isUndefined(updateId)) { // if id is undefined, return key of the latest online update
				const updateResult = await getUpdatesByStatus(deta, true, "id", desc);
				if(updateResult === UpdateGetStatus.INTERNAL_ERROR) {
					log("Internal error occurred while querying update data.", "getScoresByCountryId", LogSeverity.DEBUG);
					return ScoreGetStatus.INTERNAL_ERROR;
				}

				if(updateResult.length <= 0) {
					log("No update data in finalized status. Cancelling score data retrieval.", "getScoresByCountryId", LogSeverity.ERROR);
					return ScoreGetStatus.NO_ONLINE_UPDATE_DATA;
				}

				updateKey = _.parseInt(updateResult[0].key, 10);
			}
			else {
				if(updateId <= 0) {
					log("Invalid update ID parameter. Cancelling score data retrieval.", "getScoresByCountryId", LogSeverity.ERROR);
					return ScoreGetStatus.INVALID_UPDATE_ID;
				}

				updateKey = updateId;
			}
		}

		let query = { countryId: countryId, updateId: updateKey };
		if(!_.isNull(active)) {
			query = Object.assign(query, { isActive: active });
		}

		const fetchResult = (await db.fetch(query)).items as unknown as IScoreDetailData[];

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

		return ScoreGetStatus.INTERNAL_ERROR;
	}
}

export async function getScoresByUpdateId(deta: Deta, active: boolean | null = null, id?: number, sort: "id" | "score" | "pp" | "date" = "score", desc = false): Promise<IScoreDetailData[] | ScoreGetStatus.NO_ONLINE_UPDATE_DATA | ScoreGetStatus.INVALID_UPDATE_ID | ScoreGetStatus.INTERNAL_ERROR> {
	const db = deta.Base(DB_NAME);

	try {
		let updateKey = 0;
		{
			if(_.isUndefined(id)) { // if id is undefined, return key of the latest online update
				const updateResult = await getUpdatesByStatus(deta, true, "id", true);
				if(updateResult === UpdateGetStatus.INTERNAL_ERROR) {
					log("Internal error occurred while querying update data.", "getScoresByUpdateId", LogSeverity.DEBUG);
					return ScoreGetStatus.INTERNAL_ERROR;
				}

				if(updateResult.length <= 0) {
					log("No update data in finalized status. Cancelling score data retrieval.", "getScoresByUpdateId", LogSeverity.DEBUG);
					return ScoreGetStatus.NO_ONLINE_UPDATE_DATA;
				}

				updateKey = _.parseInt(updateResult[0].key, 10);
			}
			else {
				if(id <= 0) {
					log("Invalid update ID parameter. Cancelling score data retrieval.", "getScoresByUpdateId", LogSeverity.ERROR);
					return ScoreGetStatus.INVALID_UPDATE_ID;
				}

				updateKey = id;
			}
		}

		let query = { updateId: updateKey };
		if(!_.isNull(active)) {
			query = Object.assign(query, { isActive: active });
		}

		const fetchResult = (await db.fetch(query)).items as unknown as IScoreDetailData[];

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

		return ScoreGetStatus.INTERNAL_ERROR;
	}
}

export async function getScoreByKey(deta: Deta, key: number): Promise<IScoreDetailData | ScoreGetStatus.NO_DATA | ScoreGetStatus.INTERNAL_ERROR> {
	const db = deta.Base(DB_NAME);

	try {
		const fetchResult = (await db.get(key.toString())) as unknown as IScoreDetailData;

		if(_.isNull(fetchResult)) {
			log(`${ DB_NAME }: No data returned from database.`, "getScoreByKey", LogSeverity.WARN);
			return ScoreGetStatus.NO_DATA;
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

		return ScoreGetStatus.INTERNAL_ERROR;
	}
}

export async function getScoreByUserId(deta: Deta, id: number, updateId?: number): Promise<IScoreDetailData | ScoreGetStatus.NO_ONLINE_UPDATE_DATA | ScoreGetStatus.INVALID_UPDATE_ID | ScoreGetStatus.NO_DATA | ScoreGetStatus.DATA_TOO_MANY | ScoreGetStatus.INTERNAL_ERROR> {
	const db = deta.Base(DB_NAME);

	try {
		let updateKey: number | null = null;
		{
			if(_.isUndefined(updateId)) { // if id is undefined, return key of the latest online update
				const updateResult = await getUpdatesByStatus(deta, true, "id", true);
				if(updateResult === UpdateGetStatus.INTERNAL_ERROR) {
					log("Internal error occurred while querying update data.", "getScoreByUserId", LogSeverity.DEBUG);
					return ScoreGetStatus.INTERNAL_ERROR;
				}

				if(updateResult.length <= 0) {
					log("No update data in finalized status. Cancelling score data retrieval.", "getScoreByUserId", LogSeverity.DEBUG);
					return ScoreGetStatus.NO_ONLINE_UPDATE_DATA;
				}

				updateKey = _.parseInt(updateResult[0].key, 10);
			}
			else {
				if(updateId <= 0) {
					log("Invalid update ID parameter. Cancelling score data retrieval.", "getScoreByUserId", LogSeverity.ERROR);
					return ScoreGetStatus.INVALID_UPDATE_ID;
				}

				updateKey = updateId;
			}
		}

		{
			const user = await getUserByKey(deta, id);
			switch(user) {
				case UserGetStatus.NO_DATA:
					log("Null user returned. Cancelling score retrieval.", "getScoreByUserId", LogSeverity.DEBUG);
					return ScoreGetStatus.INTERNAL_ERROR;
				case UserGetStatus.INTERNAL_ERROR:
					log("Internal error occurred while querying user data.", "getScoreByUserId", LogSeverity.DEBUG);
					return ScoreGetStatus.INTERNAL_ERROR;
			}
		}

		const fetchResult = (await db.fetch({ userId: id, updateId: updateKey })).items as unknown as IScoreDetailData[];
		if(fetchResult.length <= 0) {
			log(`${ DB_NAME }: No data returned from database.`, "getScoreByUserId", LogSeverity.WARN);
			return ScoreGetStatus.NO_DATA;
		}
		else if(fetchResult.length > 1) {
			log(`${ DB_NAME }: Queried ${ id } with more than 1 rows. Fix the repeating occurences and try again.`, "getScoreByUserId", LogSeverity.ERROR);
			return ScoreGetStatus.DATA_TOO_MANY;
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

		return ScoreGetStatus.INTERNAL_ERROR;
	}
}

export async function getScoreByOsuId(deta: Deta, id: number): Promise<IScoreDetailData | ScoreGetStatus.NO_DATA | ScoreGetStatus.DATA_TOO_MANY | ScoreGetStatus.INTERNAL_ERROR> {
	const db = deta.Base(DB_NAME);

	try {
		const user = await getUserByOsuId(deta, id);
		{
			switch(user) {
				case UserGetStatus.NO_DATA: // fallthrough
				case UserGetStatus.DATA_TOO_MANY: // fallthrough
				case UserGetStatus.INTERNAL_ERROR:
					log("Internal error occurred while querying user data.", "getScoreByOsuId", LogSeverity.DEBUG);
					return ScoreGetStatus.INTERNAL_ERROR;
			}
		}

		const fetchResult = (await db.fetch({ userId: _.parseInt(user.key, 10) })) as unknown as IScoreDetailData[];
		if(fetchResult.length <= 0) {
			log(`${ DB_NAME }: No data returned from database.`, "getScoreByOsuId", LogSeverity.WARN);
			return ScoreGetStatus.NO_DATA;
		}
		else if(fetchResult.length > 1) {
			log(`${ DB_NAME }: Queried ${ id } with more than 1 rows. Fix the repeating occurences and try again.`, "getScoreByOsuId", LogSeverity.ERROR);
			return ScoreGetStatus.DATA_TOO_MANY;
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

		return ScoreGetStatus.INTERNAL_ERROR;
	}
}

export async function insertScore(deta: Deta, score: IScorePOSTData, updateId?: number, silent = false): Promise<ScoreInsertStatus.OK | ScoreInsertStatus.NO_UPDATE_DATA | ScoreInsertStatus.UPDATE_DATA_FINALIZED | ScoreInsertStatus.NO_OFFLINE_UPDATE_DATA | ScoreInsertStatus.INTERNAL_ERROR> {
	const db = deta.Base(DB_NAME);

	try {
		const user = await getUserByKey(deta, score.userId);
		switch(user) {
			case UserGetStatus.NO_DATA: // fallthrough
			case UserGetStatus.INTERNAL_ERROR:
				log("Internal error occurred while querying user data.", "insertScore", LogSeverity.DEBUG);
				return ScoreInsertStatus.INTERNAL_ERROR;
		}

		let currentLastId = 0;
		{
			const rows = await getScores(deta, null, "id");
			if(rows === ScoreGetStatus.INTERNAL_ERROR) {
				log("Internal error occurred while querying scores data.", "insertScore", LogSeverity.DEBUG);
				return ScoreInsertStatus.INTERNAL_ERROR;
			}

			if(rows.length > 0) {
				currentLastId = _.parseInt(rows[rows.length - 1].key, 10);
			}
		}

		let updateKey = 0;
		{
			if(!_.isUndefined(updateId)) {
				const updateResult = await getUpdateByKey(deta, updateId);
				switch(updateResult) {
					case UpdateGetStatus.NO_DATA:
						log(`${ DB_NAME }: No update data found. Canceling score insertion.`, "insertScore", LogSeverity.DEBUG);
						return ScoreInsertStatus.NO_UPDATE_DATA;
					case UpdateGetStatus.INTERNAL_ERROR:
						log("Internal error occurred while querying update data.", "insertScore", LogSeverity.DEBUG);
						return ScoreInsertStatus.INTERNAL_ERROR;
				}

				if(updateResult.online) {
					log("Update data already finalized. Cancelling score data insertion.", "insertScore", LogSeverity.ERROR);
					return ScoreInsertStatus.UPDATE_DATA_FINALIZED;
				}

				updateKey = updateId;
			}
			else {
				const updateResult = await getUpdatesByStatus(deta, false, "id", true);
				if(updateResult === UpdateGetStatus.INTERNAL_ERROR) {
					log("Internal error occurred while querying update data.", "insertScore", LogSeverity.DEBUG);
					return ScoreInsertStatus.INTERNAL_ERROR;
				}

				if(updateResult.length <= 0) {
					log("No update data in non-finalized status. Cancelling score data insertion.", "insertScore", LogSeverity.ERROR);
					return ScoreInsertStatus.NO_OFFLINE_UPDATE_DATA;
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

		return ScoreInsertStatus.OK;
	}
	catch (e) {
		if(_.isError(e)) {
			log(`An error occurred while inserting data to database. Error details below.\n${ e.name }: ${ e.message }${ process.env.DEVELOPMENT === "1" ? `\n${ e.stack }` : "" }`, "insertScore", LogSeverity.ERROR);
		}
		else {
			log("Unknown error occurred while inserting data to database.", "insertScore", LogSeverity.ERROR);
		}

		return ScoreInsertStatus.INTERNAL_ERROR;
	}
}

export async function updateScore(deta: Deta, score: IScorePOSTData, silent = false): Promise<ScoreUpdateStatus.OK | ScoreUpdateStatus.INTERNAL_ERROR | ScoreUpdateStatus.NO_SCORE | ScoreUpdateStatus.NO_USER> {
	const db = deta.Base(DB_NAME);

	try {
		const fetchedScore = await getScoreByUserId(deta, score.userId);
		switch(fetchedScore) {
			case ScoreGetStatus.NO_DATA: // fallthrough
			case ScoreGetStatus.NO_ONLINE_UPDATE_DATA: // fallthrough
			case ScoreGetStatus.INVALID_UPDATE_ID: // fallthrough
			case ScoreGetStatus.DATA_TOO_MANY:
				log("Null score returned. See above log (if any) for details.", "updateScore", LogSeverity.DEBUG);
				return ScoreUpdateStatus.NO_SCORE;
			case ScoreGetStatus.INTERNAL_ERROR:
				log("Internal error occurred while querying score data.", "updateScore", LogSeverity.DEBUG);
				return ScoreUpdateStatus.INTERNAL_ERROR;
		}

		const fetchedUser = await getUserByKey(deta, score.userId);
		switch(fetchedUser) {
			case UserGetStatus.NO_DATA:
				log("Null user returned. See above log (if any) for details.", "updateScore", LogSeverity.DEBUG);
				return ScoreUpdateStatus.NO_USER;
			case UserGetStatus.INTERNAL_ERROR:
				log("Internal error occurred while querying user data.", "updateScore", LogSeverity.DEBUG);
				return ScoreUpdateStatus.INTERNAL_ERROR;
		}

		const fetchedCountry = await getCountryByKey(deta, fetchedUser.country.countryId);
		switch(fetchedCountry) {
			case CountryGetStatus.NO_DATA:
				log("Null country returned. See above log (if any) for details.", "updateScore", LogSeverity.DEBUG);
				return ScoreUpdateStatus.NO_USER;
			case CountryGetStatus.INTERNAL_ERROR:
				log("Internal error occurred while querying user data.", "updateScore", LogSeverity.DEBUG);
				return ScoreUpdateStatus.INTERNAL_ERROR;
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

		return ScoreUpdateStatus.OK;
	}
	catch (e) {
		if(_.isError(e)) {
			log(`An error occurred while inserting data to database. Error details below.\n${ e.name }: ${ e.message }${ process.env.DEVELOPMENT === "1" ? `\n${ e.stack }` : "" }`, "updateScore", LogSeverity.ERROR);
		}
		else {
			log("Unknown error occurred while inserting data to database.", "updateScore", LogSeverity.ERROR);
		}

		return ScoreUpdateStatus.INTERNAL_ERROR;
	}
}

export async function removeScore(deta: Deta, key: number, silent = false): Promise<ScoreDeleteStatus.OK | ScoreDeleteStatus.INTERNAL_ERROR> {
	const db = deta.Base(DB_NAME);

	try {
		await db.delete(key.toString());

		if(!silent) {
			log(`${ DB_NAME }: Removed 1 row.`, "removeScore", LogSeverity.LOG);
		}

		return ScoreDeleteStatus.OK;
	}
	catch (e) {
		if(_.isError(e)) {
			log(`An error occurred while inserting data to database. Error details below.\n${ e.name }: ${ e.message }${ process.env.DEVELOPMENT === "1" ? `\n${ e.stack }` : "" }`, "removeScore", LogSeverity.ERROR);
		}
		else {
			log("Unknown error occurred while inserting data to database.", "removeScore", LogSeverity.ERROR);
		}

		return ScoreDeleteStatus.INTERNAL_ERROR;
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
