import { Request, Response, NextFunction } from "express";
import { IResponseData } from "../types/express";
import { IStatusData } from "../types/status";
import { HTTPStatus } from "../utils/http";
import { LogSeverity, log, criticalLogs } from "../utils/log";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getStatus(req: Request, res: Response, next: NextFunction) {
	log(`Function accessed, by clientId: ${ res.locals.decode.clientId }`, "getStatus", LogSeverity.LOG);

	const memUsages = process.memoryUsage();

	const ret: IResponseData<IStatusData> = {
		message: "Data retrieved successfully.",
		data: {
			memory: {
				arrayBuffers: parseFloat((memUsages.arrayBuffers / 1048576).toFixed(2)),
				external: parseFloat((memUsages.external / 1048576).toFixed(2)),
				heapTotal: parseFloat((memUsages.heapTotal / 1048576).toFixed(2)),
				heapUsed: parseFloat((memUsages.heapUsed / 1048576).toFixed(2)),
				rss: parseFloat((memUsages.rss / 1048576).toFixed(2))
			},
			criticalLogs: {
				logs: criticalLogs,
				length: criticalLogs.length
			}
		}
	};

	res.status(HTTPStatus.OK).json(ret);
}
