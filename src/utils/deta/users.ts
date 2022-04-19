import _ from "lodash";
import Deta from "deta/dist/types/deta";
import { IUserCountryDetailData, IUserDetailData } from "../../types/deta/user";
import { IUserCountryData, IUserPOSTData, IUserPUTData } from "../../types/user";
import { getCountryByKey } from "./countries";
import { LogSeverity, log } from "../log";

const DB_NAME = "osu-users";

export async function getUsers(deta: Deta, active: boolean | null = null, sort: "id" | "date" = "id", desc = false) {
	const db = deta.Base(DB_NAME);

	try {
		/* TODO: use Object.assign() for multiple fetch query assignments */
		const fetchResult = (_.isNull(active) ? (await db.fetch()) : (await db.fetch({ isActive: active }))).items as unknown as IUserCountryDetailData[];

		if(fetchResult.length <= 0) {
			log(`${ DB_NAME }: No data returned from database.`, "getUsers", LogSeverity.WARN);
			return [];
		}

		fetchResult.sort((a, b) => {
			let compA = 0;
			let compB = 0;

			if(sort === "id") {
				compA = _.parseInt(a.key, 10);
				compB = _.parseInt(b.key, 10);
			}
			else {
				compA = (typeof(a.dateAdded) === "string" ? new Date(a.dateAdded) : a.dateAdded).getTime();
				compB = (typeof(b.dateAdded) === "string" ? new Date(b.dateAdded) : b.dateAdded).getTime();
			}

			return desc ? compB - compA : compA - compB;
		});

		log(`${ DB_NAME }: Returned ${ fetchResult.length } row${ fetchResult.length !== 1 ? "s" : "" }.`, "getUsers", LogSeverity.WARN);
		return fetchResult;
	}
	catch (e) {
		if(_.isError(e)) {
			log(`An error occurred while querying database. Error details below.\n${ e.name }: ${ e.message }${ process.env.DEVELOPMENT === "1" ? `\n${ e.stack }` : "" }`, "getUsers", LogSeverity.ERROR);
		}
		else {
			log("Unknown error occurred while querying database.", "getUsers", LogSeverity.ERROR);
		}

		return [];
	}
}

export async function getUsersByCountryId(deta: Deta, active: boolean | null = null, id: number, sort: "id" | "date" = "id", desc = false) {
	const db = deta.Base(DB_NAME);

	try {
		{
			{
				const country = await getCountryByKey(deta, id);
				if(_.isNull(country)) {
					log("Country not found. Cancelling score data retrieval.", "getUsersByCountryId", LogSeverity.WARN);
					return [];
				}
			}
		}

		const fetchResult = (_.isNull(active) ? (await db.fetch({ countryId: id })) : (await db.fetch({ countryId: id, isActive: active }))).items as unknown as IUserDetailData[];

		if(fetchResult.length <= 0) {
			log(`${ DB_NAME }: No data returned from database.`, "getUsersByCountryId", LogSeverity.WARN);
			return [];
		}

		fetchResult.sort((a, b) => {
			let compA = 0;
			let compB = 0;

			if(sort === "id") {
				compA = _.parseInt(a.key, 10);
				compB = _.parseInt(b.key, 10);
			}
			else {
				compA = (typeof(a.dateAdded) === "string" ? new Date(a.dateAdded) : a.dateAdded).getTime();
				compB = (typeof(b.dateAdded) === "string" ? new Date(b.dateAdded) : b.dateAdded).getTime();
			}

			return desc ? compB - compA : compA - compB;
		});

		log(`${ DB_NAME }: Returned ${ fetchResult.length } row${ fetchResult.length !== 1 ? "s" : "" }.`, "getUsersByCountryId", LogSeverity.WARN);
		return fetchResult;
	}
	catch (e) {
		if(_.isError(e)) {
			log(`An error occurred while querying database. Error details below.\n${ e.name }: ${ e.message }${ process.env.DEVELOPMENT === "1" ? `\n${ e.stack }` : "" }`, "getUsersByCountryId", LogSeverity.ERROR);
		}
		else {
			log("Unknown error occurred while querying database.", "getUsersByCountryId", LogSeverity.ERROR);
		}

		return [];
	}
}

export async function getUserByKey(deta: Deta, key: number) {
	const db = deta.Base(DB_NAME);

	try {
		const fetchResult = (await db.get(key.toString())) as unknown as IUserCountryDetailData;

		if(_.isNull(fetchResult)) {
			log(`${ DB_NAME }: No data returned from database.`, "getUserByKey", LogSeverity.WARN);
		}
		else {
			log(`${ DB_NAME }: Returned 1 row.`, "getUserByKey", LogSeverity.LOG);
		}

		return fetchResult;
	}
	catch (e) {
		if(_.isError(e)) {
			log(`An error occurred while querying database. Error details below.\n${ e.name }: ${ e.message }${ process.env.DEVELOPMENT === "1" ? `\n${ e.stack }` : "" }`, "getUserByKey", LogSeverity.ERROR);
		}
		else {
			log("Unknown error occurred while querying database.", "getUserByKey", LogSeverity.ERROR);
		}

		return null;
	}
}

export async function getUserByOsuId(deta: Deta, id: number) {
	const db = deta.Base(DB_NAME);

	try {
		const fetchResult = (await db.fetch({ osuId: id.toString() })).items as unknown as IUserDetailData[];
		if(fetchResult.length <= 0) {
			log(`${ DB_NAME }: No data returned from database.`, "getUserByOsuId", LogSeverity.WARN);
			return null;
		}
		else if(fetchResult.length > 1) {
			log(`${ DB_NAME }: Queried ${ id } with more than 1 rows. Fix the repeating occurences and try again.`, "getUserByOsuId", LogSeverity.ERROR);
			return null;
		}

		log(`${ DB_NAME }: Returned 1 row.`, "getUserByOsuId", LogSeverity.LOG);
		return fetchResult[0];
	}
	catch (e) {
		if(_.isError(e)) {
			log(`An error occurred while querying database. Error details below.\n${ e.name }: ${ e.message }${ process.env.DEVELOPMENT === "1" ? `\n${ e.stack }` : "" }`, "getUserByOsuId", LogSeverity.ERROR);
		}
		else {
			log("Unknown error occurred while querying database.", "getUserByOsuId", LogSeverity.ERROR);
		}

		return null;
	}
}

export async function insertUser(deta: Deta, user: IUserPOSTData, silent = false) {
	const db = deta.Base(DB_NAME);

	try {
		const country = await getCountryByKey(deta, user.countryId);
		if(_.isNull(country)) {
			log("Null country returned. See above log (if any) for details.", "insertUser", LogSeverity.ERROR);
			return false;
		}

		const countryKey = _.parseInt(country.key, 10);

		let currentLastId = 0;
		{
			const rows = await getUsers(deta, null, "id");
			if(rows.length > 0) {
				currentLastId = _.parseInt(rows[rows.length - 1].key, 10);
			}
		}

		const data: IUserCountryData = {
			userName: user.userName,
			osuId: user.osuId,
			isActive: user.isActive,
			country: {
				countryId: countryKey,
				countryName: country.countryName,
				countryCode: country.countryCode
			}
		};

		const date = new Date();

		await db.put({
			userName: data.userName,
			osuId: data.osuId,
			isActive: data.isActive,
			country: JSON.parse(JSON.stringify(data.country)),
			countryId: countryKey,
			dateAdded: date.toISOString()
		}, (currentLastId + 1).toString());

		if(!silent) {
			log(`${ DB_NAME }: Deleted 1 row.`, "insertUser", LogSeverity.LOG);
		}

		return true;
	}
	catch (e) {
		if(_.isError(e)) {
			log(`An error occurred while querying database. Error details below.\n${ e.name }: ${ e.message }${ process.env.DEVELOPMENT === "1" ? `\n${ e.stack }` : "" }`, "insertUser", LogSeverity.ERROR);
		}
		else {
			log("Unknown error occurred while querying database.", "insertUser", LogSeverity.ERROR);
		}

		return false;
	}
}

export async function updateUser(deta: Deta, user: IUserPUTData, silent = false) {
	const db = deta.Base(DB_NAME);

	try {
		const fetchedUser = await getUserByKey(deta, user.userId);
		if(_.isNull(fetchedUser)) {
			log("Null user returned. See above log (if any) for details.", "updateUser", LogSeverity.ERROR);
			return false;
		}

		const fetchedCountry = await getCountryByKey(deta, user.countryId);
		if(_.isNull(fetchedCountry)) {
			log("Null country returned. See above log (if any) for details.", "updateUser", LogSeverity.ERROR);
			return false;
		}

		const countryKey = _.parseInt(fetchedCountry.key, 10);

		await db.update({
			userName: user.userName,
			isActive: user.isActive,
			country: {
				countryId: countryKey,
				countryName: fetchedCountry.countryName,
				countryCode: fetchedCountry.countryCode
			},
			countryId: countryKey
		}, fetchedUser.key);

		if(!silent) {
			log(`${ DB_NAME }: Updated 1 row.`, "updateUser", LogSeverity.LOG);
		}

		return true;
	}
	catch (e) {
		if(_.isError(e)) {
			log(`An error occurred while querying database. Error details below.\n${ e.name }: ${ e.message }${ process.env.DEVELOPMENT === "1" ? `\n${ e.stack }` : "" }`, "updateUser", LogSeverity.ERROR);
		}
		else {
			log("Unknown error occurred while querying database.", "updateUser", LogSeverity.ERROR);
		}

		return false;
	}
}

export async function removeUser(deta: Deta, key: number, silent = false) {
	const db = deta.Base(DB_NAME);

	try {
		await db.delete(key.toString());

		if(!silent) {
			log(`${ DB_NAME }: Deleted 1 row.`, "removeUser", LogSeverity.LOG);
		}

		return true;
	}
	catch (e) {
		if(_.isError(e)) {
			log(`An error occurred while querying database. Error details below.\n${ e.name }: ${ e.message }${ process.env.DEVELOPMENT === "1" ? `\n${ e.stack }` : "" }`, "removeUser", LogSeverity.ERROR);
		}
		else {
			log("Unknown error occurred while querying database.", "removeUser", LogSeverity.ERROR);
		}

		return false;
	}
}
