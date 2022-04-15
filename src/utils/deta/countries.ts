import _ from "lodash";
import Deta from "deta/dist/types/deta";
import { ICountryPOSTData, ICountryItemDetailData } from "../../types/country";
import { IUserCountryInsertion } from "../../types/user";
import { log, LogLevel } from "../log";

const DB_NAME = "osu-countries";

export async function getCountries(deta: Deta, sort: "id" | "date" = "date") {
	const db = deta.Base(DB_NAME);

	try {
		const fetchResult = (await db.fetch()).items as unknown as ICountryItemDetailData[];
		if(sort === "date") {
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
			log(`getCountries :: ${ e.name }: ${ e.message }\n${ e.stack }`);
		}
		else {
			log("getCountries :: Unknown error occurred.");
		}

		return [];
	}
}

export async function getCountryByKey(deta: Deta, key: number) {
	const db = deta.Base(DB_NAME);

	try {
		const fetchResult = (await db.get(key.toString())) as unknown as ICountryItemDetailData;
		return fetchResult;
	}
	catch (e) {
		if(_.isError(e)) {
			log(`getCountry :: ${ e.name }: ${ e.message }\n${ e.stack }`);
		}
		else {
			log("getCountry :: Unknown error occurred.");
		}

		return null;
	}
}

export async function getCountryByCode(deta: Deta, code: string) {
	const db = deta.Base(DB_NAME);

	try {
		const fetchResult = (await db.fetch({ countryCode: code })).items as unknown as ICountryItemDetailData[];
		if(fetchResult.length <= 0) {
			return null;
		}
		else if(fetchResult.length > 1) {
			log(`getCountryByCode :: Queried ${ code } with more than 1 rows. Fix the repeating occurences and try again.`, LogLevel.ERROR);
			return null;
		}

		return fetchResult[0];
	}
	catch (e) {
		if(_.isError(e)) {
			log(`getCountryByCode :: ${ e.name }: ${ e.message }\n${ e.stack }`);
		}
		else {
			log("getCountryByCode :: Unknown error occurred.");
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
				currentLastId = parseInt(rows[rows.length - 1].key, 10);
			}
		}

		const date = new Date();

		await db.put({
			countryName: country.countryName,
			countryCode: country.countryCode,
			recentlyInactive: 0,
			highestId: 0,
			dateAdded: date.toISOString()
		}, (currentLastId + 1).toString());

		if(!silent) {
			log(`insertCountry :: ${ DB_NAME }: Inserted 1 row.`, LogLevel.LOG);
		}

		return true;
	}
	catch (e) {
		if(_.isError(e)) {
			log(`insertCountry :: ${ e.name }: ${ e.message }\n${ e.stack }`);
		}
		else {
			log("insertCountry :: Unknown error occurred.");
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
			log(`updateInactiveCount :: ${ DB_NAME }: Updated ${ countriesData.length } rows.`, LogLevel.LOG);
		}

		return true;
	}
	catch (e) {
		if(_.isError(e)) {
			log(`updateInactiveCount :: ${ e.name }: ${ e.message }\n${ e.stack }`);
		}
		else {
			log("updateInactiveCount :: Unknown error occurred.");
		}

		return false;
	}
}

export async function removeCountry(deta: Deta, key: number, silent = false) {
	const db = deta.Base(DB_NAME);

	try {
		await db.delete(key.toString());

		if(!silent) {
			log(`removeCountry :: ${ DB_NAME }: Deleted 1 row.`, LogLevel.LOG);
		}

		return true;
	}
	catch (e) {
		if(_.isError(e)) {
			log(`removeCountry :: ${ e.name }: ${ e.message }\n${ e.stack }`);
		}
		else {
			log("removeCountry :: Unknown error occurred.");
		}

		return false;
	}
}
