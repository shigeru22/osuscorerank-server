import _ from "lodash";
import Deta from "deta/dist/types/deta";
import { IClientData, IClientDetailData } from "../../types/auth";
import { LogLevel, log } from "../log";
import { randomBytes } from "crypto";

const DB_NAME = "client-auth";

export async function getClientById(deta: Deta, id: string) {
	const db = deta.Base(DB_NAME);

	try {
		const fetchResult = (await db.fetch({ clientId: id })).items as unknown as IClientDetailData[];
		if(fetchResult.length <= 0) {
			return null;
		}
		else if(fetchResult.length > 1) {
			log(`getClientById :: Queried ${ id } with more than 1 rows. Fix the repeating occurrences and try again.`, LogLevel.ERROR);
			return null;
		}

		return fetchResult[0];
	}
	catch (e) {
		if(_.isError(e)) {
			log(`getClientById :: ${ e.name }: ${ e.message }\n${ e.stack }`, LogLevel.ERROR);
		}
		else {
			log("getClientById :: Unknown error occurred.", LogLevel.ERROR);
		}

		return null;
	}
}

export async function insertClient(deta: Deta, id: string, name: string) {
	const db = deta.Base(DB_NAME);

	try {
		let currentLastId = 0;
		{
			const rows = (await db.fetch()).items as unknown as IClientDetailData[];
			if(rows.length > 0) {
				currentLastId = _.parseInt(rows[rows.length - 1].key, 10);
			}
		}

		const data: IClientData = {
			clientId: id,
			clientName: name,
			clientKey: randomBytes(32).toString("hex")
		};

		const date = new Date();

		await db.put({
			clientId: data.clientId,
			clientName: data.clientName,
			clientKey: data.clientKey,
			dateAdded: date.toISOString()
		}, (currentLastId + 1).toString());

		log(`addClient :: ${ DB_NAME }: inserted 1 row.`, LogLevel.LOG);
		return true;
	}
	catch (e) {
		if(_.isError(e)) {
			log(`addClient :: ${ e.name }: ${ e.message }\n${ e.stack }`, LogLevel.ERROR);
		}
		else {
			log("addClient :: Unknown error occurred.", LogLevel.ERROR);
		}

		return false;
	}
}
