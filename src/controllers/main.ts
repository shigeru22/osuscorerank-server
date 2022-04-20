import { NextFunction, Request, Response } from "express";
import _ from "lodash";
import { IResponseMessage } from "../types/express";
import { IDummyPOSTData } from "../types/main";
import { insertClient } from "../utils/deta/auth";
import { getUpdates, insertUpdate } from "../utils/deta/updates";
import { insertCountry } from "../utils/deta/countries";
import { insertUser } from "../utils/deta/users";
import { insertScore } from "../utils/deta/scores";
import { secureTimingSafeEqual } from "../utils/crypto";
import { HTTPStatus } from "../utils/http";
import { LogSeverity, log } from "../utils/log";

export function getGreeting(req: Request, res: Response) {
	log("Function accessed. Sending greeting message.", "getGreeting", LogSeverity.LOG);

	const ret: IResponseMessage = {
		message: "Hello, world!"
	};

	res.status(HTTPStatus.OK).json(ret);
}

export function getNotFoundMessage(req: Request, res: Response) {
	log("API endpoint not found. Sending error message.", "getNotFoundMessage", LogSeverity.LOG);

	const ret: IResponseMessage = {
		message: "API endpoint not found."
	};

	res.status(HTTPStatus.NOT_FOUND).json(ret);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function addDummyData(req: Request, res: Response, next: NextFunction) {
	log("Function accessed.", "addDummyData", LogSeverity.LOG);

	if(_.isUndefined(process.env.TOKEN_SECRET)) {
		log("TOKEN_SECRET is not yet defined. See .env-template for details.", "addDummyData", LogSeverity.ERROR);

		const ret: IResponseMessage = {
			message: "Secret is not defined. Please contact system administrator."
		};

		res.status(HTTPStatus.BAD_REQUEST).json(ret);
		return;
	}

	{
		const clients = await getUpdates(res.locals.deta);
		if(clients.length > 0) {
			const ret: IResponseMessage = {
				message: "Data already exist."
			};

			res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(ret);
			return;
		}
	}

	const data: IDummyPOSTData = req.body;
	if(!validateDummyPostData(data)) {
		const ret: IResponseMessage = {
			message: "Invalid POST data."
		};

		res.status(HTTPStatus.BAD_REQUEST).json(ret);
		return;
	}

	{
		const equal = secureTimingSafeEqual(process.env.TOKEN_SECRET, data.secret);
		if(!equal) {
			log("Invalid secret given. Sending error response.", "addDummyData", LogSeverity.WARN);

			const ret: IResponseMessage = {
				message: "Invalid credentials."
			};

			res.status(HTTPStatus.UNAUTHORIZED).json(ret);
			return;
		}
	}

	let result = await insertClient(res.locals.deta, "C0001", "Webmaster's client");
	if(!result) {
		const ret: IResponseMessage = {
			message: "An error occurred while inserting client data."
		};

		res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(ret);
		return;
	}

	result = await insertUpdate(res.locals.deta, {
		apiVersion: "1.0.0",
		webVersion: "1.0.0"
	});

	if(!result) {
		const ret: IResponseMessage = {
			message: "An error occurred while inserting update data."
		};

		res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(ret);
		return;
	}

	result = await insertCountry(res.locals.deta, {
		countryName: "Indonesia",
		countryCode: "ID"
	});

	if(!result) {
		const ret: IResponseMessage = {
			message: "An error occurred while inserting country data."
		};

		res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(ret);
		return;
	}

	result = await insertUser(res.locals.deta, {
		userName: "Shigeru22",
		osuId: 2581664,
		countryId: 1,
		isActive: true
	});

	if(!result) {
		const ret: IResponseMessage = {
			message: "An error occurred while inserting user data."
		};

		res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(ret);
		return;
	}

	result = await insertScore(res.locals.deta, {
		userId: 1,
		score: 48662338537,
		pp: 8645
	});

	if(!result) {
		const ret: IResponseMessage = {
			message: "An error occurred while inserting score data."
		};

		res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(ret);
		return;
	}

	log("All dummy data inserted successfully. Sending success response.", "addDummyData", LogSeverity.LOG);

	const ret: IResponseMessage = {
		message: "Dummy data inserted successfully."
	};

	res.status(HTTPStatus.OK).json(ret);
}

function validateDummyPostData(data: IDummyPOSTData) {
	const isDefined = !_.isUndefined(data.secret);
	const hasValidTypes = _.isString(data.secret);
	const hasValidData = isDefined && (!_.isEmpty(data.secret));

	log(`isDefined: ${ isDefined }, hasValidTypes: ${ hasValidTypes }, hasValidData: ${ hasValidData }`, "validateDummyPostData", LogSeverity.DEBUG);
	if(!isDefined || !hasValidTypes || !hasValidData) {
		log("Invalid POST data found.", "validateDummyPostData", LogSeverity.WARN);
	}

	return isDefined && hasValidTypes && hasValidData;
}
