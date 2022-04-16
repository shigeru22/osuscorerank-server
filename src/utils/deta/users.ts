import _ from "lodash";
import Deta from "deta/dist/types/deta";
import { IUserData, IUserDetailData, IUserPOSTData } from "../../types/user";
import { LogLevel, log } from "../log";
import { getCountryByKey } from "./countries";

const DB_NAME = "osu-users";

export async function getUsers(deta: Deta, sort: "id" | "date" = "id") {
	const db = deta.Base(DB_NAME);

	try {
		const fetchResult = (await db.fetch()).items as unknown as IUserDetailData[];
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
			log(`getUsers :: ${ e.name }: ${ e.message }\n${ e.stack }`, LogLevel.ERROR);
		}
		else {
			log("getUsers :: Unknown error occurred.", LogLevel.ERROR);
		}

		return [];
	}
}

export async function getUserByKey(deta: Deta, key: number) {
	const db = deta.Base(DB_NAME);

	try {
		const fetchResult = (await db.get(key.toString())) as unknown as IUserDetailData;
		return fetchResult;
	}
	catch (e) {
		if(_.isError(e)) {
			log(`getUserByKey :: ${ e.name }: ${ e.message }\n${ e.stack }`, LogLevel.ERROR);
		}
		else {
			log("getUserByKey :: Unknown error occurred.", LogLevel.ERROR);
		}

		return null;
	}
}

export async function getUserByOsuId(deta: Deta, id: number) {
	const db = deta.Base(DB_NAME);

	try {
		const fetchResult = (await db.fetch({ osuId: id.toString() })).items as unknown as IUserDetailData[];
		if(fetchResult.length <= 0) {
			return null;
		}
		else if(fetchResult.length > 1) {
			log(`getUserByOsuId :: Queried ${ id } with more than 1 rows. Fix the repeating occurences and try again.`, LogLevel.ERROR);
			return null;
		}

		return fetchResult[0];
	}
	catch (e) {
		if(_.isError(e)) {
			log(`getUserByOsuId :: ${ e.name }: ${ e.message }\n${ e.stack }`, LogLevel.ERROR);
		}
		else {
			log("getUserByOsuId :: Unknown error occurred.", LogLevel.ERROR);
		}

		return null;
	}
}

export async function insertUser(deta: Deta, user: IUserPOSTData, silent = false) {
	const db = deta.Base(DB_NAME);

	try {
		const country = await getCountryByKey(deta, user.countryId);
		if(_.isNull(country)) {
			log("insertUser :: Country not found.", LogLevel.ERROR);
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
			log(`insertUser :: ${ DB_NAME }: Deleted 1 row.`, LogLevel.LOG);
		}

		return true;
	}
	catch (e) {
		if(_.isError(e)) {
			log(`insertUser :: ${ e.name }: ${ e.message }\n${ e.stack }`, LogLevel.ERROR);
		}
		else {
			log("insertUser :: Unknown error occurred.", LogLevel.ERROR);
		}

		return false;
	}
}

export async function updateUser(deta: Deta, user: IUserPOSTData, silent = false) {
	const db = deta.Base(DB_NAME);

	try {
		const fetchedUser = await getUserByOsuId(deta, user.osuId);
		if(_.isNull(fetchedUser)) {
			log("updateUser :: Null user returned. See above log for details.", LogLevel.ERROR);
			return false;
		}

		const fetchedCountry = await getCountryByKey(deta, user.countryId);
		if(_.isNull(fetchedCountry)) {
			log("updateUser :: Null country returned. See above log (if any) for details.", LogLevel.ERROR);
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
			log(`updateUser :: ${ DB_NAME }: Updated 1 row.`, LogLevel.LOG);
		}

		return true;
	}
	catch (e) {
		if(_.isError(e)) {
			log(`updateUser :: ${ e.name }: ${ e.message }\n${ e.stack }`, LogLevel.ERROR);
		}
		else {
			log("updateUser :: Unknown error occurred.", LogLevel.ERROR);
		}

		return false;
	}
}

export async function removeUser(deta: Deta, key: number, silent = false) {
	const db = deta.Base(DB_NAME);

	try {
		await db.delete(key.toString());

		if(!silent) {
			log(`removeUser :: ${ DB_NAME }: Deleted 1 row.`, LogLevel.LOG);
		}

		return true;
	}
	catch (e) {
		if(_.isError(e)) {
			log(`removeUser :: ${ e.name }: ${ e.message }\n${ e.stack }`, LogLevel.ERROR);
		}
		else {
			log("removeUser :: Unknown error occurred.", LogLevel.ERROR);
		}

		return false;
	}
}
