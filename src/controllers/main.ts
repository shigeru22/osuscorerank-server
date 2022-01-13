import { NextFunction, Request, Response } from "express";

export async function getGreeting(req: Request, res: Response, next: NextFunction) {
  const ret = {
    "message": "Hello, world!"
  }

  res.status(200).json(ret);
}
