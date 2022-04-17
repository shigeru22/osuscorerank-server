import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import _ from "lodash";
import { IResponseMessage } from "../types/express";
import { HTTPStatus } from "../utils/http";
import { LogSeverity, log } from "../utils/log";

export function verifyToken(req: Request, res: Response, next: NextFunction) {
	log("Function accessed.", "verifyToken", LogSeverity.LOG);

	const secret = process.env.TOKEN_SECRET;
	if(!secret) {
		log("TOKEN_SECRET is not yet defined. See .env-template for details.", "verifyToken", LogSeverity.ERROR);

		const ret: IResponseMessage = {
			message: "Secret is not defined. Please contact system administrator."
		};

		return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(ret);
	}

	const authorization = req.headers.authorization;
	if(_.isUndefined(authorization)) {
		log("Authorization is not provided in header. Sending error response.", "verifyToken", LogSeverity.WARN);

		const ret: IResponseMessage = {
			message: "Authorization is not provided."
		};

		return res.status(HTTPStatus.UNAUTHORIZED).json(ret);
	}

	const arrAuth = _.split(authorization, " ", 2);
	if(arrAuth.length !== 2) {
		log("Invalid authorization provided. Sending error response.", "verifyToken", LogSeverity.WARN);

		const ret: IResponseMessage = {
			message: "Invalid authorization is provided."
		};

		return res.status(HTTPStatus.UNAUTHORIZED).json(ret);
	}

	if(arrAuth[0] !== "Bearer") {
		log("Authorization must be Bearer. Sending error response.", "verifyToken", LogSeverity.WARN);

		const ret: IResponseMessage = {
			message: "Non-bearer authorization is provided."
		};

		return res.status(HTTPStatus.UNAUTHORIZED).json(ret);
	}

	const accessToken = arrAuth[1];

	try {
		const decode = jwt.verify(accessToken, secret);

		log("Token verified. Executing next function.", "verifyToken", LogSeverity.LOG);

		res.locals.decode = decode;
		return next();
	}
	catch (e) {
		if(_.isError(e)) {
			if(e.name === "TokenExpiredError") {
				log("Token expired. Sending error response.", "verifyToken", LogSeverity.WARN);

				const ret: IResponseMessage = {
					message: "Token expired. Please try again."
				};

				return res.status(HTTPStatus.UNAUTHORIZED).json(ret);
			}
			else if(e.name === "JsonWebTokenError") {
				log("Unable to verify token. Sending error response.", "verifyToken", LogSeverity.WARN);

				const ret: IResponseMessage = {
					message: "Authentication failed. Check your access token and try again."
				};

				return res.status(HTTPStatus.UNAUTHORIZED).json(ret);
			}

			log(`An error occurred. Sending error response. Error details below.\n$${ e.name }: ${ e.message }\n${ e.stack }`, "verifyToken", LogSeverity.ERROR);

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
