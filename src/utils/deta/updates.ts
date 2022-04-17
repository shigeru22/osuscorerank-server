import _ from "lodash";
import Deta from "deta/dist/types/deta";
import { IUpdateDetailData } from "../../types/deta/update";
import { IUpdateData, IUpdatePOSTData } from "../../types/update";
import { LogSeverity, log } from "../log";

const DB_NAME = "data-updates";

export async function getUpdates(deta: Deta, sort: "id" | "date" = "date", desc = false) {
	const db = deta.Base(DB_NAME);

	try {
		const fetchResult = (await db.fetch()).items as unknown as IUpdateDetailData[];

		if(fetchResult.length <= 0) {
			log(`${ DB_NAME }: No data returned from database.`, "getScores", LogSeverity.WARN);
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

		log(`${ DB_NAME }: Returned ${ fetchResult.length } row${ fetchResult.length !== 1 ? "s" : "" }.`, "getScores", LogSeverity.LOG);
		return fetchResult;
	}
	catch (e) {
		if(_.isError(e)) {
			log(`An error occurred while querying database. Error details below.\n${ e.name }: ${ e.message }${ process.env.DEVELOPMENT === "1" ? `\n${ e.stack }` : "" }`, "getUpdates", LogSeverity.ERROR);
		}
		else {
			log("Unknown error occurred while querying database.", "getUpdates", LogSeverity.ERROR);
		}

		return [];
	}
}

export async function getUpdateByKey(deta: Deta, key: number) {
	const db = deta.Base(DB_NAME);

	try {
		const fetchResult = (await db.get(key.toString())) as unknown as IUpdateDetailData;

		if(_.isNull(fetchResult)) {
			log(`${ DB_NAME }: No data returned from database.`, "getUpdateByKey", LogSeverity.WARN);
		}
		else {
			log(`${ DB_NAME }: Returned 1 row.`, "getUpdateByKey", LogSeverity.LOG);
		}

		return fetchResult;
	}
	catch (e) {
		if(_.isError(e)) {
			log(`An error occurred while querying database. Error details below.\n${ e.name }: ${ e.message }${ process.env.DEVELOPMENT === "1" ? `\n${ e.stack }` : "" }`, "getUpdateByKey", LogSeverity.ERROR);
		}
		else {
			log("Unknown error occurred while querying database.", "getUpdateByKey", LogSeverity.ERROR);
		}

		return null;
	}
}

export async function insertUpdate(deta: Deta, update: IUpdatePOSTData, silent = false) {
	const db = deta.Base(DB_NAME);

	try {
		let currentLastId = 0;
		{
			const rows = await getUpdates(deta, "id");
			if(rows.length > 0) {
				currentLastId = _.parseInt(rows[rows.length - 1].key, 10);
			}
		}

		const date = new Date();

		const data: IUpdateData = {
			date,
			apiVersion: update.apiVersion,
			webVersion: update.webVersion
		};

		await db.put({
			date: data.date.toISOString(),
			apiVersion: data.apiVersion,
			webVersion: data.webVersion,
			dateAdded: date.toISOString()
		}, (currentLastId + 1).toString());

		if(!silent) {
			log(`${ DB_NAME }: Inserted 1 row.`, "insertUpdate", LogSeverity.LOG);
		}

		return true;
	}
	catch (e) {
		if(_.isError(e)) {
			log(`An error occurred while inserting data to database.. Error details below.\n${ e.name }: ${ e.message }${ process.env.DEVELOPMENT === "1" ? `\n${ e.stack }` : "" }`, "insertUpdate", LogSeverity.ERROR);
		}
		else {
			log("Unknown error occurred while inserting data to database.", "insertUpdate", LogSeverity.ERROR);
		}

		return false;
	}
}
