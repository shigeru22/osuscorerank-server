import _ from "lodash";
import Deta from "deta/dist/types/deta";
import { ICountryItemDetailData } from "../../types/deta/country";
import { ICountryPOSTData } from "../../types/country";
import { CountryGetStatus, CountryInsertStatus, CountryDeleteStatus } from "../status";
import { log, LogSeverity } from "../log";

const DB_NAME = "osu-countries";

export async function getCountries(deta: Deta, sort: "id" | "date" = "id", desc = false, silent = false): Promise<ICountryItemDetailData[] | CountryGetStatus.INTERNAL_ERROR> {
	const db = deta.Base(DB_NAME);

	try {
		const fetchResult = (await db.fetch()).items as unknown as ICountryItemDetailData[];

		if(fetchResult.length <= 0) {
			if(!silent) {
				log(`${ DB_NAME }: No data returned from database.`, "getCountries", LogSeverity.WARN);
			}

			return [];
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

		if(!silent) {
			log(`${ DB_NAME }: Returned ${ fetchResult.length } row${ fetchResult.length !== 1 ? "s" : "" }.`, "getCountries", LogSeverity.LOG);
		}

		return fetchResult;
	}
	catch (e) {
		if(_.isError(e)) {
			log(`An error occurred while querying database. Error details below.\n${ e.name }: ${ e.message }${ process.env.DEVELOPMENT === "1" ? `\n${ e.stack }` : "" }`, "getCountries", LogSeverity.ERROR);
		}
		else {
			log("Unknown error occurred while querying database.", "getCountries", LogSeverity.ERROR);
		}

		return CountryGetStatus.INTERNAL_ERROR;
	}
}

export async function getCountryByKey(deta: Deta, key: number): Promise<ICountryItemDetailData | CountryGetStatus.NO_DATA | CountryGetStatus.INTERNAL_ERROR> {
	const db = deta.Base(DB_NAME);

	try {
		const fetchResult = (await db.get(key.toString())) as unknown as ICountryItemDetailData;

		if(_.isNull(fetchResult)) {
			log(`${ DB_NAME }: No data returned from database.`, "getCountryByKey", LogSeverity.WARN);
			return CountryGetStatus.NO_DATA;
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

		return CountryGetStatus.INTERNAL_ERROR;
	}
}

export async function getCountryByCode(deta: Deta, code: string): Promise<ICountryItemDetailData | CountryGetStatus.NO_DATA | CountryGetStatus.DATA_TOO_MANY | CountryGetStatus.INTERNAL_ERROR> {
	const db = deta.Base(DB_NAME);

	try {
		const fetchResult = (await db.fetch({ countryCode: code })).items as unknown as ICountryItemDetailData[];
		if(fetchResult.length <= 0) {
			log(`${ DB_NAME }: No data returned from database.`, "getCountryByCode", LogSeverity.WARN);
			return CountryGetStatus.NO_DATA;
		}
		else if(fetchResult.length > 1) {
			log(`${ DB_NAME }: Queried ${ code } with more than 1 rows. Fix the repeating occurences and try again.`, "getCountryByCode", LogSeverity.ERROR);
			return CountryGetStatus.DATA_TOO_MANY;
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

		return CountryGetStatus.INTERNAL_ERROR;
	}
}

export async function insertCountry(deta: Deta, country: ICountryPOSTData, silent = false): Promise<CountryInsertStatus.OK | CountryInsertStatus.INTERNAL_ERROR> {
	const db = deta.Base(DB_NAME);

	try {
		let currentLastId = 0;
		{
			const rows = await getCountries(deta, "id");
			if(rows === CountryGetStatus.INTERNAL_ERROR) {
				return CountryInsertStatus.INTERNAL_ERROR;
			}

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

		return CountryInsertStatus.OK;
	}
	catch (e) {
		if(_.isError(e)) {
			log(`An error occurred while inserting data to database.. Error details below.\n${ e.name }: ${ e.message }${ process.env.DEVELOPMENT === "1" ? `\n${ e.stack }` : "" }`, "insertCountry", LogSeverity.ERROR);
		}
		else {
			log("Unknown error occurred while inserting data to database.", "insertCountry", LogSeverity.ERROR);
		}

		return CountryInsertStatus.INTERNAL_ERROR;
	}
}

export async function removeCountry(deta: Deta, key: number, silent = false): Promise<CountryDeleteStatus.OK | CountryDeleteStatus.INTERNAL_ERROR> {
	const db = deta.Base(DB_NAME);

	try {
		await db.delete(key.toString());

		if(!silent) {
			log(`${ DB_NAME }: Deleted 1 row.`, "removeCountry", LogSeverity.LOG);
		}

		return CountryDeleteStatus.OK;
	}
	catch (e) {
		if(_.isError(e)) {
			log(`An error occurred while removing data from database. Error details below.\n${ e.name }: ${ e.message }${ process.env.DEVELOPMENT === "1" ? `\n${ e.stack }` : "" }`, "removeCountry", LogSeverity.ERROR);
		}
		else {
			log("Unknown error occurred while removing data from database.", "removeCountry", LogSeverity.ERROR);
		}

		return CountryDeleteStatus.INTERNAL_ERROR;
	}
}
