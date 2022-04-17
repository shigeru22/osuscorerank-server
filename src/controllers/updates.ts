import { Request, Response, NextFunction } from "express";
import _ from "lodash";
import { IResponseData, IResponseMessage } from "../types/express";
import { IUpdatePOSTData, IUpdateResponse, IUpdatesResponse } from "../types/update";
import { getUpdateByKey, getUpdates, insertUpdate } from "../utils/deta/updates";
import { HTTPStatus } from "../utils/http";
import { LogSeverity, log } from "../utils/log";
import { checkNumber } from "../utils/common";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getAllUpdates(req: Request, res: Response, next: NextFunction) {
	log("Function accessed.", "getAllUpdates", LogSeverity.LOG);

	let sort: "id" | "date" = "id";
	{
		if(!_.isUndefined(req.query.sort)) {
			const id = _.parseInt(req.query.sort as string, 10);
			if(_.isNaN(id) || (id < 1 || id > 2)) {
				log("Invalid sort parameter. Sending error response.", "getAllUpdates", LogSeverity.WARN);

				const ret: IResponseMessage = {
					message: "Invalid sort parameter."
				};

				res.status(HTTPStatus.BAD_REQUEST).json(ret);
				return;
			}

			switch(id) {
				case 2: sort = "date"; break;
			}
		}
	}

	let desc = false;
	{
		if(!_.isUndefined(req.query.desc)) {
			if(!_.isString(req.query.desc) || !(req.query.desc === "true" || req.query.desc === "false")) {
				log("Invalid desc parameter. Sending error response.", "getAllUpdates", LogSeverity.WARN);

				const ret: IResponseMessage = {
					message: "Invalid desc parameter."
				};

				res.status(HTTPStatus.BAD_REQUEST).json(ret);
				return;
			}

			if(req.query.desc === "true") {
				desc = true;
			}
		}
	}

	const data = await getUpdates(res.locals.deta, sort, desc);
	if(data.length <= 0) {
		const ret: IResponseMessage = {
			message: "No data found."
		};

		res.status(HTTPStatus.NOT_FOUND).json(ret);
		return;
	}

	log("Updates data retrieved successfully. Sending data response.", "getAllUpdates", LogSeverity.LOG);

	const ret: IResponseData<IUpdatesResponse> = {
		message: "Data retrieved successfully.",
		data: {
			updatesData: data.map(item => ({
				date: item.date,
				apiVersion: item.apiVersion,
				webVersion: item.webVersion
			})),
			length: data.length
		}
	};

	res.status(HTTPStatus.OK).json(ret);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getLatestUpdate(req: Request, res: Response, next: NextFunction) {
	log("Function accessed.", "getLatestUpdate", LogSeverity.LOG);

	const data = await getUpdates(res.locals.deta, "id", true);
	if(data.length <= 0) {
		const ret: IResponseMessage = {
			message: "No data found."
		};

		res.status(HTTPStatus.NOT_FOUND).json(ret);
		return;
	}

	log("Scores data retrieved successfully. Sending data response.", "getLatestUpdate", LogSeverity.LOG);

	const ret: IResponseData<IUpdateResponse> = {
		message: "Data retrieved successfully.",
		data: {
			updateData: {
				date: data[0].date,
				apiVersion: data[0].apiVersion,
				webVersion: data[0].webVersion
			}
		}
	};

	res.status(HTTPStatus.OK).json(ret);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getUpdate(req: Request, res: Response, next: NextFunction) {
	log("Function accessed.", "getUpdate", LogSeverity.LOG);

	const id = _.parseInt(req.params.updateId, 10);
	if(!checkNumber(id) || id <= 0) {
		log("Invalid ID parameter. Sending error message.", "getUpdate", LogSeverity.WARN);

		const ret: IResponseMessage = {
			message: "Invalid ID parameter."
		};

		res.status(HTTPStatus.BAD_REQUEST).json(ret);
		return;
	}

	const data = await getUpdateByKey(res.locals.deta, id);
	if(_.isNull(data)) {
		const ret: IResponseMessage = {
			message: "Update data with specified ID not found."
		};

		res.status(HTTPStatus.NOT_FOUND).json(ret);
		return;
	}

	log("Update data retrieved successfully. Sending data response.", "getUpdate", LogSeverity.LOG);

	const ret: IResponseData<IUpdateResponse> = {
		message: "Data retrieved successfully.",
		data: {
			updateData: {
				date: data.date,
				apiVersion: data.apiVersion,
				webVersion: data.webVersion
			}
		}
	};

	res.status(HTTPStatus.OK).json(ret);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function addUpdateData(req: Request, res: Response, next: NextFunction) {
	log(`Function accessed, by clientId: ${ res.locals.decode.clientId }`, "addUpdateData", LogSeverity.LOG);

	const data: IUpdatePOSTData = {
		apiVersion: "1.0.0",
		webVersion: "1.0.0"
	};

	if(!validateUpdatePostData(data)) {
		const ret: IResponseMessage = {
			message: "Invalid POST data."
		};

		res.status(HTTPStatus.BAD_REQUEST).json(ret);
		return;
	}

	const result = await insertUpdate(res.locals.deta, data);

	if(!result) {
		const ret: IResponseMessage = {
			message: "Data insertion failed."
		};

		res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(ret);
		return;
	}

	log("Update data inserted successfully. Sending data response.", "addUpdateData", LogSeverity.LOG);

	const ret: IResponseMessage = {
		message: "Data inserted successfully."
	};

	res.status(HTTPStatus.OK).json(ret);
}

function validateUpdatePostData(data: IUpdatePOSTData) {
	const isDefined = !_.isUndefined(data.apiVersion) && !_.isUndefined(data.webVersion);
	const hasValidTypes = _.isString(data.apiVersion) && _.isString(data.webVersion);
	const hasValidData = isDefined && (!_.isEmpty(data.apiVersion) && !_.isEmpty(data.webVersion));

	log(`isDefined: ${ isDefined }, hasValidTypes: ${ hasValidTypes }, hasValidData: ${ hasValidData }`, "validateUpdatePostData", LogSeverity.DEBUG);
	if(!isDefined || !hasValidTypes || !hasValidData) {
		log("Invalid POST data found.", "validateUpdatePostData", LogSeverity.WARN);
	}

	return isDefined && hasValidTypes && hasValidData;
}
