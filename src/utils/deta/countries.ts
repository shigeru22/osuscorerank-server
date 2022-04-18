import _ from "lodash";
import Deta from "deta/dist/types/deta";
import { ICountryItemDetailData } from "../../types/deta/country";
import { ICountryPOSTData } from "../../types/country";
import { IUserCountryInsertion } from "../../types/user";
import { log, LogSeverity } from "../log";

const DB_NAME = "osu-countries";

export async function getCountries(deta: Deta, sort: "id" | "date" = "id", desc = false) {
	const db = deta.Base(DB_NAME);

	try {
		const fetchResult = (await db.fetch()).items as unknown as ICountryItemDetailData[];

		if(fetchResult.length <= 0) {
			log(`${ DB_NAME }: No data returned from database.`, "getCountries", LogSeverity.WARN);
		}

		fetchResult.sort((a, b) => {
			let compA = 0;
			let compB = 0;

			if(sort === "id") {
				compA = _.parseInt(a.key);
				compB = _.parseInt(b.key);
			}
			else {
				compA = (typeof(a.dateAdded) === "string" ? new Date(a.dateAdded) : a.dateAdded).getTime();
				compB = (typeof(b.dateAdded) === "string" ? new Date(b.dateAdded) : b.dateAdded).getTime();
			}

			return desc ? compB - compA : compA - compB;
		});

		log(`${ DB_NAME }: Returned ${ fetchResult.length } row${ fetchResult.length !== 1 ? "s" : "" }.`, "getCountries", LogSeverity.LOG);

		return fetchResult;
	}
	catch (e) {
		if(_.isError(e)) {
			log(`An error occurred while querying database. Error details below.\n${ e.name }: ${ e.message }${ process.env.DEVELOPMENT === "1" ? `\n${ e.stack }` : "" }`, "getCountries", LogSeverity.ERROR);
		}
		else {
			log("Unknown error occurred while querying database.", "getCountries", LogSeverity.ERROR);
		}

		return [];
	}
}

export async function getCountryByKey(deta: Deta, key: number) {
	const db = deta.Base(DB_NAME);

	try {
		const fetchResult = (await db.get(key.toString())) as unknown as ICountryItemDetailData;

		if(_.isNull(fetchResult)) {
			log(`${ DB_NAME }: No data returned from database.`, "getCountryByKey", LogSeverity.WARN);
		}
		else {
			log(`${ DB_NAME }: Returned 1 row.`, "getCountryByKey", LogSeverity.LOG);
		}

		return fetchResult;
	}
	catch (e) {
		if(_.isError(e)) {
			log(`An error occurred while querying database. Error details below.\n${ e.name }: ${ e.message }${ process.env.DEVELOPMENT === "1" ? `\n${ e.stack }` : "" }`, "getCountryByKey", LogSeverity.ERROR);
		}
		else {
			log("Unknown error occurred while querying database.", "getCountryByKey", LogSeverity.ERROR);
		}

		return null;
	}
}

export async function getCountryByCode(deta: Deta, code: string) {
	const db = deta.Base(DB_NAME);

	try {
		const fetchResult = (await db.fetch({ countryCode: code })).items as unknown as ICountryItemDetailData[];
		if(fetchResult.length <= 0) {
			log(`${ DB_NAME }: No data returned from database.`, "getCountryByCode", LogSeverity.WARN);
			return null;
		}
		else if(fetchResult.length > 1) {
			log(`${ DB_NAME }: Queried ${ code } with more than 1 rows. Fix the repeating occurences and try again.`, "getCountryByCode", LogSeverity.ERROR);
			return null;
		}

		log(`${ DB_NAME }: Returned 1 row.`, "getCountryByCode", LogSeverity.LOG);
		return fetchResult[0];
	}
	catch (e) {
		if(_.isError(e)) {
			log(`An error occurred while querying database. Error details below.\n${ e.name }: ${ e.message }${ process.env.DEVELOPMENT === "1" ? `\n${ e.stack }` : "" }`, "getCountryByCode", LogSeverity.ERROR);
		}
		else {
			log("Unknown error occurred while querying database.", "getCountryByCode", LogSeverity.ERROR);
		}

		return null;
	}
}

export async function insertCountry(deta: Deta, country: ICountryPOSTData, silent = false) {
	const db = deta.Base(DB_NAME);

	try {
		let currentLastId = 0;
		{
			const rows = await getCountries(deta, "id");
			if(rows.length > 0) {
				currentLastId = _.parseInt(rows[rows.length - 1].key, 10);
			}
		}

		const date = new Date();

		await db.put({
			countryName: country.countryName,
			countryCode: country.countryCode,
			dateAdded: date.toISOString()
		}, (currentLastId + 1).toString());

		if(!silent) {
			log(`${ DB_NAME }: Inserted 1 row.`, "insertCountry", LogSeverity.LOG);
		}

		return true;
	}
	catch (e) {
		if(_.isError(e)) {
			log(`An error occurred while inserting data to database.. Error details below.\n${ e.name }: ${ e.message }${ process.env.DEVELOPMENT === "1" ? `\n${ e.stack }` : "" }`, "insertCountry", LogSeverity.ERROR);
		}
		else {
			log("Unknown error occurred while inserting data to database.", "insertCountry", LogSeverity.ERROR);
		}

		return false;
	}
}

/* TODO: define whether this is used */
export async function updateInactiveCount(deta: Deta, countriesData: IUserCountryInsertion[], silent = false) {
	const db = deta.Base(DB_NAME);

	try {
		const updateRequest: Promise<null>[] = [];

		countriesData.forEach(data => updateRequest.push(db.update({ recentlyInactive: data.insertion }, data.countryId.toString())));
		await Promise.all(updateRequest);

		if(!silent) {
			log(`${ DB_NAME }: Updated ${ countriesData.length } row${ countriesData.length !== 1 ? "s" : "" }.`, "updateInactiveCount", LogSeverity.LOG);
		}

		return true;
	}
	catch (e) {
		if(_.isError(e)) {
			log(`An error occurred while updating data in database. Error details below.\n${ e.name }: ${ e.message }${ process.env.DEVELOPMENT === "1" ? `\n${ e.stack }` : "" }`, "updateInactiveCount", LogSeverity.ERROR);
		}
		else {
			log("Unknown error occurred while updating data in database.", "updateInactiveCount", LogSeverity.ERROR);
		}

		return false;
	}
}

export async function removeCountry(deta: Deta, key: number, silent = false) {
	const db = deta.Base(DB_NAME);

	try {
		await db.delete(key.toString());

		if(!silent) {
			log(`${ DB_NAME }: Deleted 1 row.`, "removeCountry", LogSeverity.LOG);
		}

		return true;
	}
	catch (e) {
		if(_.isError(e)) {
			log(`An error occurred while removing data from database. Error details below.\n${ e.name }: ${ e.message }${ process.env.DEVELOPMENT === "1" ? `\n${ e.stack }` : "" }`, "removeCountry", LogSeverity.ERROR);
		}
		else {
			log("Unknown error occurred while removing data from database.", "removeCountry", LogSeverity.ERROR);
		}

		return false;
	}
}
