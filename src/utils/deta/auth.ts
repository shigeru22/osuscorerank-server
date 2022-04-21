import { randomBytes } from "crypto";
import Deta from "deta/dist/types/deta";
import _ from "lodash";
import { IClientDetailData } from "../../types/deta/auth";
import { IClientData } from "../../types/auth";
import { ClientGetStatus, ClientInsertStatus } from "../status";
import { LogSeverity, log } from "../log";

const DB_NAME = "client-auth";

export async function getClientById(deta: Deta, id: string): Promise<IClientDetailData | ClientGetStatus.NO_DATA | ClientGetStatus.DATA_TOO_MANY | ClientGetStatus.INTERNAL_ERROR> {
	const db = deta.Base(DB_NAME);

	try {
		const fetchResult = (await db.fetch({ clientId: id })).items as unknown as IClientDetailData[];
		if(fetchResult.length <= 0) {
			log("No data returned from database.", "getClientById", LogSeverity.WARN);
			return ClientGetStatus.NO_DATA;
		}
		else if(fetchResult.length > 1) {
			log(`${ DB_NAME }: Queried ${ id } with more than 1 rows. Fix the repeating occurrences and try again.`, "getClientById", LogSeverity.ERROR);
			return ClientGetStatus.DATA_TOO_MANY;
		}

		log(`${ DB_NAME }: Returned 1 row.`, "getClientById", LogSeverity.LOG);
		return fetchResult[0];
	}
	catch (e) {
		if(_.isError(e)) {
			log(`An error occurred while querying database. Error details below.\n${ e.name }: ${ e.message }${ process.env.DEVELOPMENT === "1" ? `\n${ e.stack }` : "" }`, "getClientById", LogSeverity.ERROR);
		}
		else {
			log("Unknown error occurred.", "getClientById", LogSeverity.ERROR);
		}

		return ClientGetStatus.INTERNAL_ERROR;
	}
}

export async function insertClient(deta: Deta, id: string, name: string): Promise<ClientInsertStatus.OK | ClientInsertStatus.INTERNAL_ERROR> {
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

		log(`${ DB_NAME }: Inserted 1 row.`, "insertClient", LogSeverity.LOG);
		return ClientInsertStatus.OK;
	}
	catch (e) {
		if(_.isError(e)) {
			log(`An error occurred while inserting data to database. Error details below.\n${ e.name }: ${ e.message }${ process.env.DEVELOPMENT === "1" ? `\n${ e.stack }` : "" }`, "insertClient", LogSeverity.ERROR);
		}
		else {
			log("Unknown error occurred while inserting data to database.", "insertClient", LogSeverity.ERROR);
		}

		return ClientInsertStatus.INTERNAL_ERROR;
	}
}
