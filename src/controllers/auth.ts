import { Request, Response } from "express";
import _ from "lodash";
import { timingSafeEqual } from "crypto";
import jwt from "jsonwebtoken";
import { IClientPOSTData, IAuthenticationResponse } from "../types/auth";
import { IResponseMessage, IResponseData } from "../types/express";
import { HTTPStatus } from "../utils/http";
import { LogLevel, log } from "../utils/log";
import { getClientById } from "../utils/prisma/auth";

export async function getAccessToken(req: Request, res: Response) {
	try {
		if(_.isUndefined(process.env.TOKEN_SECRET)) {
			const ret: IResponseMessage = {
				message: "Secret is not defined. Please contact system administrator."
			};

			res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(ret);
			return;
		}

		const data: IClientPOSTData = req.body;

		if(!validateClientPostData(data)) {
			const ret: IResponseMessage = {
				message: "Invalid POST data."
			};

			res.status(HTTPStatus.BAD_REQUEST).json(ret);
			return;
		}

		const client = await getClientById(data.clientId);

		if(_.isNull(client)) {
			const ret: IResponseMessage = {
				message: "Invalid client ID or key."
			};

			res.status(HTTPStatus.UNAUTHORIZED).json(ret);
			return;
		}

		const keyBuffer = Buffer.from(data.clientKey, "utf8");
		const dbKeyBuffer = Buffer.from(client.clientKey, "utf8");

		const equal = timingSafeEqual(keyBuffer, dbKeyBuffer);

		if(!equal) {
			const ret: IResponseMessage = {
				message: "Invalid client ID or key."
			};

			res.status(HTTPStatus.UNAUTHORIZED).json(ret);
			return;
		}

		const token = jwt.sign({ clientId: client.clientId }, process.env.TOKEN_SECRET, { expiresIn: "1d" });

		const ret: IResponseData<IAuthenticationResponse> = {
			message: "Authenticated successfully.",
			data: {
				accessToken: token,
				expiresIn: "1d"
			}
		};

		log(`getAccessToken(): Access token generated for ${ client.clientName }.`, LogLevel.LOG);
		res.status(HTTPStatus.OK).json(ret);
		return;
	}
	catch (e) {
		if(_.isError(e)) {
			const ret: IResponseMessage = {
				message: "An error occurred."
			};

			log(`getAccessToken() :: ${ e.name }: ${ e.message }`, LogLevel.ERROR);

			res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(ret);
			return;
		}

		const ret: IResponseMessage = {
			message: "Unknown error occurred."
		};

		res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(ret);
	}
}

function validateClientPostData(data: IClientPOSTData) {
	const hasValidTypes = _.isString(data.clientId) && _.isString(data.clientKey);
	const hasValidData = !_.isEmpty(data.clientId) && (!_.isEmpty(data.clientKey) && data.clientKey.length === 64);

	log(`validateClientPostData :: hasValidTypes: ${ hasValidTypes }, hasValidData: ${ hasValidData }`, LogLevel.DEBUG);

	return hasValidTypes && hasValidData;
}
