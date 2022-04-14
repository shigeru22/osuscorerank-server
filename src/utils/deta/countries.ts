import _ from "lodash";
import Deta from "deta/dist/types/deta";
import { ICountryPOSTData, ICountryItemData, ICountryItemDetailData } from "../../types/country";
import { log, LogLevel } from "../log";

const DB_NAME = "osu-countries";

export async function getCountries(deta: Deta, sort: "id" | "date" = "date") {
	const db = deta.Base(DB_NAME);

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

export async function insertCountry(deta: Deta, countries: ICountryPOSTData, silent = false) {
	const db = deta.Base(DB_NAME);

	const data: ICountryItemData = {
		countryName: countries.countryName,
		countryCode: countries.countryCode,
		recentlyInactive: 0,
		highestId: 0
	};

	const date = new Date();

	try {
		let currentLastId = 0;
		{
			const rows = await getCountries(deta, "id");
			if(rows.length > 0) {
				currentLastId = parseInt(rows[rows.length - 1].key, 10);
			}
		}

		await db.put({
			countryName: data.countryName,
			countryCode: data.countryCode,
			recentlyInactive: data.recentlyInactive,
			highestId: data.highestId,
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
