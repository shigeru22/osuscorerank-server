import { Request, Response } from "express";
import { HTTPStatus } from "../utils/http";
import { LogLevel, log } from "../utils/log";

export function getGreeting(req: Request, res: Response) {
	log("Accessed: getGreeting()", LogLevel.LOG);

	const ret = {
		message: "Hello, world!"
	};

	res.status(HTTPStatus.OK).json(ret);
}
