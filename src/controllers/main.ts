import { Request, Response } from "express";
import { HTTPStatus } from "../utils/http";

export function getGreeting(req: Request, res: Response) {
	console.log("[LOG] Accessed: getGreeting()");

	const ret = {
		message: "Hello, world!"
	};

	res.status(HTTPStatus.OK).json(ret);
}
