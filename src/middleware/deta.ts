import { Request, Response, NextFunction } from "express";
import { Deta } from "deta";
import _ from "lodash";
import { IResponseMessage } from "../types/express";
import { HTTPStatus } from "../utils/http";
import { LogLevel, log } from "../utils/log";

export function verifyProjectKey(req: Request, res: Response, next: NextFunction) {
	const key = process.env.DETA_PROJECT_KEY;
	if(_.isUndefined(key)) {
		const ret: IResponseMessage = {
			message: "Project key is not defined."
		};

		log("DETA_PROJECT_KEY is not defined.", LogLevel.ERROR);
		return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(ret);
	}

	const deta = Deta(key);

	try {
		return next(deta);
	}
	catch (e) {
		if(_.isError(e)) {
			log(`verifyToken() :: ${ e.name }: ${ e.message }\n${ e.stack }`);

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
