import { Request, Response } from "express";

export function getGreeting(req: Request, res: Response) {
	const ret = {
		"message": "Hello, world!"
	};

	res.status(200).json(ret);
}
