import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import _ from "lodash";
import { IResponseMessage } from "../types/express";
import { HTTPStatus } from "../utils/http";
import { LogLevel, log } from "../utils/log";

export function verifyToken(req: Request, res: Response, next: NextFunction) {
	const secret = process.env.TOKEN_SECRET;
	if(!secret) {
		const ret: IResponseMessage = {
			message: "Secret is not defined. Please contact system administrator."
		};

		log("TOKEN_SECRET is not defined.", LogLevel.ERROR);
		return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(ret);
	}

	const authorization = req.headers.authorization;
	if(_.isUndefined(authorization)) {
		const ret: IResponseMessage = {
			message: "Authorization is not provided."
		};

		return res.status(HTTPStatus.UNAUTHORIZED).json(ret);
	}

	const arrAuth = _.split(authorization, " ", 2);
	if(arrAuth.length !== 2) {
		const ret: IResponseMessage = {
			message: "Invalid authentication is provided."
		};

		return res.status(HTTPStatus.UNAUTHORIZED).json(ret);
	}

	if(arrAuth[0] !== "Bearer") {
		const ret: IResponseMessage = {
			message: "Non-bearer authentication is provided."
		};

		return res.status(HTTPStatus.UNAUTHORIZED).json(ret);
	}

	const accessToken = arrAuth[1];

	try {
		const decode = jwt.verify(accessToken, secret);
		return next(decode);
	}
	catch (e) {
		if(_.isError(e)) {
			if(e.name === "TokenExpiredError") {
				const ret: IResponseMessage = {
					message: "Token expired. Please try again."
				};

				log(`verifyToken() :: ${ e.name }: ${ e.message }`, LogLevel.ERROR);
				return res.status(HTTPStatus.UNAUTHORIZED).json(ret);
			}
			else if(e.name === "JsonWebTokenError") {
				const ret: IResponseMessage = {
					message: "Authentication failed. Check your access token and try again."
				};

				log(`verifyToken() :: ${ e.name }: ${ e.message }`, LogLevel.ERROR);
				return res.status(HTTPStatus.UNAUTHORIZED).json(ret);
			}

			const ret: IResponseMessage = {
				message: "An error occurred. Please contact system administrator."
			};

			return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(ret);
		}

		const ret: IResponseMessage = {
			message: "Unknown error occurred while verifying token."
		};

		return res.status(HTTPStatus.UNAUTHORIZED).json(ret);
	}
}
