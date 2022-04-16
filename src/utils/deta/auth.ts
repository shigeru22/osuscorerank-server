import _ from "lodash";
import Deta from "deta/dist/types/deta";
import { IClientDetailData } from "../../types/auth";
import { LogLevel, log } from "../log";

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
			log(`getScores :: ${ e.name }: ${ e.message }\n${ e.stack }`, LogLevel.ERROR);
		}
		else {
			log("getScores :: Unknown error occurred.", LogLevel.ERROR);
		}

		return null;
	}
}
