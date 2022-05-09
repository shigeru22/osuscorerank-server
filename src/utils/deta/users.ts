import _ from "lodash";
import Deta from "deta/dist/types/deta";
import { IUserCountryDetailData, IUserDetailData } from "../../types/deta/user";
import { IUserCountryData, IUserPOSTData, IUserPUTData } from "../../types/user";
import { CountryGetStatus, UserGetStatus, UserInsertStatus, UserUpdateStatus, UserDeleteStatus } from "../status";
import { getCountryByKey } from "./countries";
import { LogSeverity, log } from "../log";

const DB_NAME = "osu-users";

export async function getUsers(deta: Deta, active: boolean | null = null, sort: "id" | "date" = "id", desc = false, silent = false): Promise<IUserCountryDetailData[] | UserGetStatus.INTERNAL_ERROR> {
	const db = deta.Base(DB_NAME);

	try {
		let query = {};
		if(!_.isNull(active)) {
			query = Object.assign(query, { isActive: active });
		}

		let queryResult = await db.fetch(query);
		const fetchResult = queryResult.items as unknown as IUserCountryDetailData[];

		while(queryResult.last) {
			// eslint-disable-next-line no-await-in-loop
			queryResult = await db.fetch(query, { last: queryResult.last });
			const tempItems = queryResult.items as unknown as IUserCountryDetailData[];
			fetchResult.push(...tempItems);
		}

		if(fetchResult.length <= 0) {
			if(!silent) {
				log(`${ DB_NAME }: No data returned from database.`, "getUsers", LogSeverity.WARN);
			}

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

		if(!silent) {
			log(`${ DB_NAME }: Returned ${ fetchResult.length } row${ fetchResult.length !== 1 ? "s" : "" }.`, "getUsers", LogSeverity.LOG);
		}

		return fetchResult;
	}
	catch (e) {
		if(_.isError(e)) {
			log(`An error occurred while querying database. Error details below.\n${ e.name }: ${ e.message }${ process.env.DEVELOPMENT === "1" ? `\n${ e.stack }` : "" }`, "getUsers", LogSeverity.ERROR);
		}
		else {
			log("Unknown error occurred while querying database.", "getUsers", LogSeverity.ERROR);
		}

		return UserGetStatus.INTERNAL_ERROR;
	}
}

export async function getUsersByCountryId(deta: Deta, active: boolean | null = null, id: number, sort: "id" | "date" = "id", desc = false): Promise<IUserDetailData[] | UserGetStatus.INTERNAL_ERROR> {
	const db = deta.Base(DB_NAME);

	try {
		let query = { countryId: id };
		if(!_.isNull(active)) {
			query = Object.assign(query, { isActive: active });
		}

		let queryResult = await db.fetch(query);
		const fetchResult = queryResult.items as unknown as IUserDetailData[];

		while(queryResult.last) {
			// eslint-disable-next-line no-await-in-loop
			queryResult = await db.fetch(query, { last: queryResult.last });
			const tempItems = queryResult.items as unknown as IUserDetailData[];
			fetchResult.push(...tempItems);
		}

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

		return UserGetStatus.INTERNAL_ERROR;
	}
}

export async function getUserByKey(deta: Deta, key: number, silent = false): Promise<IUserCountryDetailData | UserGetStatus.NO_DATA | UserGetStatus.INTERNAL_ERROR> {
	const db = deta.Base(DB_NAME);

	try {
		const fetchResult = (await db.get(key.toString())) as unknown as IUserCountryDetailData;

		if(_.isNull(fetchResult)) {
			if(!silent) {
				log(`${ DB_NAME }: No data returned from database.`, "getUserByKey", LogSeverity.WARN);
			}

			return UserGetStatus.NO_DATA;
		}

		if(!silent) {
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

		return UserGetStatus.INTERNAL_ERROR;
	}
}

export async function getUserByOsuId(deta: Deta, id: number): Promise<IUserDetailData | UserGetStatus.NO_DATA | UserGetStatus.DATA_TOO_MANY | UserGetStatus.INTERNAL_ERROR> {
	const db = deta.Base(DB_NAME);

	try {
		const fetchResult = (await db.fetch({ osuId: id.toString() })).items as unknown as IUserDetailData[];
		if(fetchResult.length <= 0) {
			log(`${ DB_NAME }: No data returned from database.`, "getUserByOsuId", LogSeverity.WARN);
			return UserGetStatus.NO_DATA;
		}
		else if(fetchResult.length > 1) {
			log(`${ DB_NAME }: Queried ${ id } with more than 1 rows. Fix the repeating occurences and try again.`, "getUserByOsuId", LogSeverity.ERROR);
			return UserGetStatus.DATA_TOO_MANY;
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

		return UserGetStatus.INTERNAL_ERROR;
	}
}

export async function insertUser(deta: Deta, user: IUserPOSTData, silent = false): Promise<UserInsertStatus.OK | UserInsertStatus.INTERNAL_ERROR> {
	const db = deta.Base(DB_NAME);

	try {
		const country = await getCountryByKey(deta, user.countryId);
		switch(country) {
			case CountryGetStatus.NO_DATA: // fallthrough
			case CountryGetStatus.INTERNAL_ERROR:
				log("Internal error occurred while querying country data.", "insertUser", LogSeverity.DEBUG);
				return UserInsertStatus.INTERNAL_ERROR;
		}

		const countryKey = _.parseInt(country.key, 10);

		let currentLastId = 0;
		{
			const rows = await getUsers(deta, null, "id");
			if(rows === UserGetStatus.INTERNAL_ERROR) {
				log("Internal error occurred while querying users data.", "insertUser", LogSeverity.DEBUG);
				return UserInsertStatus.INTERNAL_ERROR;
			}

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

		return UserInsertStatus.OK;
	}
	catch (e) {
		if(_.isError(e)) {
			log(`An error occurred while querying database. Error details below.\n${ e.name }: ${ e.message }${ process.env.DEVELOPMENT === "1" ? `\n${ e.stack }` : "" }`, "insertUser", LogSeverity.ERROR);
		}
		else {
			log("Unknown error occurred while querying database.", "insertUser", LogSeverity.ERROR);
		}

		return UserInsertStatus.INTERNAL_ERROR;
	}
}

export async function updateUser(deta: Deta, user: IUserPUTData, silent = false): Promise<UserUpdateStatus.OK | UserUpdateStatus.INTERNAL_ERROR> {
	const db = deta.Base(DB_NAME);

	try {
		const fetchedUser = await getUserByKey(deta, user.userId);
		switch(fetchedUser) {
			case UserGetStatus.NO_DATA: // fallthrough
			case UserGetStatus.INTERNAL_ERROR:
				log("Internal error occurred while querying user data.", "updateUser", LogSeverity.DEBUG);
				return UserUpdateStatus.INTERNAL_ERROR;
		}

		const fetchedCountry = await getCountryByKey(deta, user.countryId);
		switch(fetchedCountry) {
			case CountryGetStatus.NO_DATA: // fallthrough
			case CountryGetStatus.INTERNAL_ERROR:
				log("Internal error occurred while querying user data.", "updateUser", LogSeverity.DEBUG);
				return UserUpdateStatus.INTERNAL_ERROR;
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

		return UserUpdateStatus.OK;
	}
	catch (e) {
		if(_.isError(e)) {
			log(`An error occurred while querying database. Error details below.\n${ e.name }: ${ e.message }${ process.env.DEVELOPMENT === "1" ? `\n${ e.stack }` : "" }`, "updateUser", LogSeverity.ERROR);
		}
		else {
			log("Unknown error occurred while querying database.", "updateUser", LogSeverity.ERROR);
		}

		return UserUpdateStatus.INTERNAL_ERROR;
	}
}

export async function removeUser(deta: Deta, key: number, silent = false): Promise<UserDeleteStatus.OK | UserDeleteStatus.INTERNAL_ERROR> {
	const db = deta.Base(DB_NAME);

	try {
		await db.delete(key.toString());

		if(!silent) {
			log(`${ DB_NAME }: Deleted 1 row.`, "removeUser", LogSeverity.LOG);
		}

		return UserDeleteStatus.OK;
	}
	catch (e) {
		if(_.isError(e)) {
			log(`An error occurred while querying database. Error details below.\n${ e.name }: ${ e.message }${ process.env.DEVELOPMENT === "1" ? `\n${ e.stack }` : "" }`, "removeUser", LogSeverity.ERROR);
		}
		else {
			log("Unknown error occurred while querying database.", "removeUser", LogSeverity.ERROR);
		}

		return UserDeleteStatus.INTERNAL_ERROR;
	}
}
