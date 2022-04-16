import { createHmac, timingSafeEqual } from "crypto";
import { NextFunction, Request, Response } from "express";
import Deta from "deta/dist/types/deta";
import _ from "lodash";
import { IResponseMessage } from "../types/express";
import { IDummyPOSTData } from "../types/main";
import { HTTPStatus } from "../utils/http";
import { LogLevel, log } from "../utils/log";
import { insertClient } from "../utils/deta/auth";
import { insertCountry } from "../utils/deta/countries";
import { insertUser } from "../utils/deta/users";
import { insertScore } from "../utils/deta/scores";

export function getGreeting(req: Request, res: Response) {
	log("Accessed: getGreeting()", LogLevel.LOG);

	const ret: IResponseMessage = {
		message: "Hello, world!"
	};

	res.status(HTTPStatus.OK).json(ret);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function addDummyData(deta: Deta, req: Request, res: Response, next: NextFunction) {
	log("Accessed: getGreeting()", LogLevel.LOG);

	if(_.isUndefined(process.env.TOKEN_SECRET)) {
		const ret: IResponseMessage = {
			message: "Secret is not defined. Please contact system administrator."
		};

		res.status(HTTPStatus.BAD_REQUEST).json(ret);
		return;
	}

	const data: IDummyPOSTData = req.body;
	if(!validateDummyPostData(data)) {
		const ret: IResponseMessage = {
			message: "Invalid POST Data."
		};

		res.status(HTTPStatus.BAD_REQUEST).json(ret);
		return;
	}

	{
		const hashedRequestSecret = createHmac("sha256", process.env.TOKEN_SECRET).update(data.secret, "utf8").digest("hex");
		const hashedClientSecret = createHmac("sha256", process.env.TOKEN_SECRET).update(process.env.TOKEN_SECRET, "utf8").digest("hex");

		const equal = timingSafeEqual(Buffer.from(hashedRequestSecret, "utf8"), Buffer.from(hashedClientSecret, "utf8"));
		if(!equal) {
			const ret: IResponseMessage = {
				message: "Invalid credentials."
			};

			res.status(HTTPStatus.UNAUTHORIZED).json(ret);
			return;
		}
	}

	let result = await insertClient(deta, "C0001", "Webmaster's client");
	if(!result) {
		const ret: IResponseMessage = {
			message: "An error occurred while inserting client data."
		};

		res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(ret);
		return;
	}

	result = await insertCountry(deta, {
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

	result = await insertUser(deta, {
		userName: "Shigeru22",
		osuId: 2581664,
		countryId: 1
	});

	if(!result) {
		const ret: IResponseMessage = {
			message: "An error occurred while inserting user data."
		};

		res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(ret);
		return;
	}

	result = await insertScore(deta, {
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

	const ret: IResponseMessage = {
		message: "Dummy data inserted successfully."
	};

	res.status(HTTPStatus.OK).json(ret);
}

function validateDummyPostData(data: IDummyPOSTData) {
	const isDefined = !_.isUndefined(data.secret);
	const hasValidTypes = _.isString(data.secret);
	const hasValidData = isDefined && (!_.isEmpty(data.secret));

	log(`validateDummyPostData :: isDefined: ${ isDefined }, hasValidTypes: ${ hasValidTypes }, hasValidData: ${ hasValidData }`, LogLevel.DEBUG);

	return isDefined && hasValidTypes && hasValidData;
}
