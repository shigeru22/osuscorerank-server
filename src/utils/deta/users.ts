import _ from "lodash";
import Deta from "deta/dist/types/deta";
import { IUserDetailData } from "../../types/deta/user";
import { IUserData, IUserPOSTData } from "../../types/user";
import { getCountryByKey } from "./countries";
import { LogSeverity, log } from "../log";

const DB_NAME = "osu-users";

export async function getUsers(deta: Deta, sort: "id" | "date" = "id") {
	const db = deta.Base(DB_NAME);

	try {
		const fetchResult = (await db.fetch()).items as unknown as IUserDetailData[];

		if(fetchResult.length <= 0) {
			log(`${ DB_NAME }: No data returned from database.`, "getUsers", LogSeverity.WARN);
			return [];
		}

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

export async function getUserByKey(deta: Deta, key: number) {
	const db = deta.Base(DB_NAME);

	try {
		const fetchResult = (await db.get(key.toString())) as unknown as IUserDetailData;

		if(_.isNull(fetchResult)) {
			log(`${ DB_NAME }: No data returned from database.`, "getUserByKey", LogSeverity.WARN);
		}
		else {
			log(`${ DB_NAME }: Returned 1 row.`, "getCountries", LogSeverity.LOG);
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

		let currentLastId = 0;
		{
			const rows = await getUsers(deta, "id");
			if(rows.length > 0) {
				currentLastId = parseInt(rows[rows.length - 1].key, 10);
			}
		}

		const data: IUserData = {
			userName: user.userName,
			osuId: user.osuId,
			country: {
				countryId: parseInt(country.key, 10),
				countryName: country.countryName,
				countryCode: country.countryCode
			}
		};

		const date = new Date();

		await db.put({
			userName: data.userName,
			osuId: data.osuId,
			country: data.country,
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

export async function updateUser(deta: Deta, user: IUserPOSTData, silent = false) {
	const db = deta.Base(DB_NAME);

	try {
		const fetchedUser = await getUserByOsuId(deta, user.osuId);
		if(_.isNull(fetchedUser)) {
			log("Null user returned. See above log (if any) for details.", "updateUser", LogSeverity.ERROR);
			return false;
		}

		const fetchedCountry = await getCountryByKey(deta, user.countryId);
		if(_.isNull(fetchedCountry)) {
			log("Null country returned. See above log (if any) for details.", "updateUser", LogSeverity.ERROR);
			return false;
		}

		await db.update({
			userName: user.userName,
			country: {
				countryId: user.countryId.toString(),
				countryName: fetchedCountry.countryName,
				countryCode: fetchedCountry.countryCode
			}
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
