import { createHmac, timingSafeEqual } from "crypto";
import { NextFunction, Request, Response } from "express";
import Deta from "deta/dist/types/deta";
import _ from "lodash";
import jwt from "jsonwebtoken";
import { IResponseMessage, IResponseData } from "../types/express";
import { IClientPOSTData, IAuthenticationResponse } from "../types/auth";
import { getClientById } from "../utils/deta/auth";
import { HTTPStatus } from "../utils/http";
import { LogLevel, log } from "../utils/log";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getAccessToken(deta: Deta, req: Request, res: Response, next: NextFunction) {
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

		const client = await getClientById(deta, data.clientId);

		if(_.isNull(client)) {
			const ret: IResponseMessage = {
				message: "Invalid client credentials."
			};

			res.status(HTTPStatus.UNAUTHORIZED).json(ret);
			return;
		}

		{
			const hashedRequestKey = createHmac("sha256", process.env.TOKEN_SECRET).update(data.clientKey, "utf8").digest("hex");
			const hashedClientKey = createHmac("sha256", process.env.TOKEN_SECRET).update(client.clientKey, "utf8").digest("hex");

			const equal = timingSafeEqual(Buffer.from(hashedRequestKey, "utf8"), Buffer.from(hashedClientKey, "utf8"));
			if(!equal) {
				const ret: IResponseMessage = {
					message: "Invalid client credentials."
				};

				res.status(HTTPStatus.UNAUTHORIZED).json(ret);
				return;
			}
		}

		const token = jwt.sign({ clientId: client.key }, process.env.TOKEN_SECRET, { expiresIn: "1d" });

		const ret: IResponseData<IAuthenticationResponse> = {
			message: "Authentication success.",
			data: {
				accessToken: token,
				expiresIn: "1d"
			}
		};

		log(`getAccessToken :: Access token generated for ${ client.clientName }.`, LogLevel.LOG);
		res.status(HTTPStatus.OK).json(ret);
	}
	catch (e) {
		if(_.isError(e)) {
			const ret: IResponseMessage = {
				message: "An error occurred."
			};

			log(`getAccessToken :: ${ e.name }: ${ e.message }\n${ e.stack }`, LogLevel.ERROR);

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
