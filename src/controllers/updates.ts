import { Request, Response } from "express";
import _ from "lodash";
import { getLatestUpdate } from "../utils/prisma/updates";
import { HTTPStatus } from "../utils/http";
import { LogLevel, log } from "../utils/log";

export async function getLatestUpdates(req: Request, res: Response) {
	log("Accessed: getLatestUpdates", LogLevel.LOG);

	const update = await getLatestUpdate();

	if(_.isNull(update)) {
		const ret = {
			message: "Empty updates record."
		};

		res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(ret);
		return;
	}

	const ret = {
		message: "Data retrieved successfully.",
		data: {
			date: update.date,
			apiVersion: update.apiVersion,
			webVersion: update.webVersion
		}
	};

	res.status(HTTPStatus.OK).json(ret);
}
