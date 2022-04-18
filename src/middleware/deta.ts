import { Request, Response, NextFunction } from "express";
import { Deta } from "deta";
import _ from "lodash";
import { IResponseMessage } from "../types/express";
import { HTTPStatus } from "../utils/http";
import { LogSeverity, log } from "../utils/log";

export function verifyProjectKey(req: Request, res: Response, next: NextFunction) {
	log("Function accessed.", "verifyProjectKey", LogSeverity.LOG);

	const key = process.env.DETA_PROJECT_KEY;
	if(_.isUndefined(key)) {
		log("DETA_PROJECT_KEY is not defined. See .env-template for details.", "verifyProjectKey", LogSeverity.ERROR);

		const ret: IResponseMessage = {
			message: "Project key is not defined."
		};

		return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(ret);
	}

	const deta = Deta(key);

	try {
		log("Deta variable created. Executing next function.", "verifyProjectKey", LogSeverity.LOG);

		res.locals.deta = deta;
		return next();
	}
	catch (e) {
		if(_.isError(e)) {
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
