import { Request, Response, NextFunction } from "express";
import _ from "lodash";
import { IResponseData, IResponseMessage } from "../types/express";
import { IScoreDELETEData, IScorePOSTData, IScoreResponse, IScoresResponse } from "../types/score";
import { getScoreByKey, getScoreByUserId, getScores, getScoresByCountryId, insertScore, removeScore } from "../utils/deta/scores";
import { HTTPStatus } from "../utils/http";
import { LogLevel, log } from "../utils/log";
import { checkNumber } from "../utils/common";
import { getUserByKey } from "../utils/deta/users";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getAllScores(req: Request, res: Response, next: NextFunction) {
	log("Accessed: getAllUsers", LogLevel.LOG);

	const data = await getScores(res.locals.deta);
	if(data.length <= 0) {
		const ret: IResponseMessage = {
			message: "No data found."
		};

		res.status(HTTPStatus.NOT_FOUND).json(ret);
		return;
	}

	const ret: IResponseData<IScoresResponse> = {
		message: "Data retrieved successfully.",
		data: {
			scores: data.map(item => ({
				scoreId: _.parseInt(item.key, 10),
				user: item.user,
				score: item.score,
				pp: item.pp
			})),
			length: data.length
		}
	};

	res.status(HTTPStatus.OK).json(ret);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getCountryScores(req: Request, res: Response, next: NextFunction) {
	log("Accessed: getCountryScores", LogLevel.LOG);

	const id = _.parseInt(req.params.countryId, 10);
	if(!checkNumber(id) || id <= 0) {
		const ret: IResponseMessage = {
			message: "Invalid ID parameter."
		};

		res.status(HTTPStatus.BAD_REQUEST).json(ret);
		return;
	}

	const data = await getScoresByCountryId(res.locals.deta, id);
	if(data.length <= 0) {
		const ret: IResponseMessage = {
			message: "No data found."
		};

		res.status(HTTPStatus.NOT_FOUND).json(ret);
		return;
	}

	const ret: IResponseData<IScoresResponse> = {
		message: "Data retrieved successfully.",
		data: {
			scores: data.map(item => ({
				scoreId: _.parseInt(item.key, 10),
				user: item.user,
				score: item.score,
				pp: item.pp
			})),
			length: data.length
		}
	};

	res.status(HTTPStatus.OK).json(ret);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getScore(req: Request, res: Response, next: NextFunction) {
	log("Accessed: getScore", LogLevel.LOG);

	const id = _.parseInt(req.params.scoreId, 10);
	if(!checkNumber(id) || id <= 0) {
		const ret: IResponseMessage = {
			message: "Invalid ID parameter."
		};

		res.status(HTTPStatus.BAD_REQUEST).json(ret);
		return;
	}

	const data = await getScoreByKey(res.locals.deta, id);
	if(_.isNull(data)) {
		const ret: IResponseMessage = {
			message: "Score with specified ID can't be found."
		};

		res.status(HTTPStatus.NOT_FOUND).json(ret);
		return;
	}

	const ret: IResponseData<IScoreResponse> = {
		message: "Data retrieved successfully.",
		data: {
			score: {
				scoreId: _.parseInt(data.key, 10),
				user: data.user,
				score: data.score,
				pp: data.pp
			}
		}
	};

	res.status(HTTPStatus.OK).json(ret);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getUserScore(req: Request, res: Response, next: NextFunction) {
	log("Accessed: getUserScore", LogLevel.LOG);

	const id = _.parseInt(req.params.userId, 10);
	if(!checkNumber(id) || id <= 0) {
		const ret: IResponseMessage = {
			message: "Invalid ID parameter."
		};

		res.status(HTTPStatus.BAD_REQUEST).json(ret);
		return;
	}

	const data = await getScoreByUserId(res.locals.deta, id);
	if(_.isNull(data)) {
		const ret: IResponseMessage = {
			message: "Score with specified ID can't be found."
		};

		res.status(HTTPStatus.NOT_FOUND).json(ret);
		return;
	}

	const ret: IResponseData<IScoreResponse> = {
		message: "Data retrieved successfully.",
		data: {
			score: {
				scoreId: _.parseInt(data.key, 10),
				user: data.user,
				score: data.score,
				pp: data.pp
			}
		}
	};

	res.status(HTTPStatus.OK).json(ret);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getMultipleUserScores(req: Request, res: Response, next: NextFunction) {
	log("Accessed: getMultipleUserScores", LogLevel.LOG);

	const sortQuery = _.parseInt(req.query.sort as string, 10);
	if(!_.isArray(req.query.users)) {
		const ret: IResponseMessage = {
			message: "Invalid users parameter."
		};

		res.status(HTTPStatus.BAD_REQUEST).json(ret);
		return;
	}

	if(req.query.users.length <= 0) {
		const ret: IResponseMessage = {
			message: "Invalid array length."
		};

		res.status(HTTPStatus.BAD_REQUEST).json(ret);
		return;
	}

	let sort: "id" | "score" | "pp" | "date" = "id";
	if(!_.isUndefined(req.query.sort)) {
		if(sortQuery < 1 || sortQuery > 4) {
			const ret: IResponseMessage = {
				message: "Invalid sort parameter."
			};

			res.status(HTTPStatus.BAD_REQUEST).json(ret);
			return;
		}

		switch(sortQuery) {
			case 2: sort = "score"; break;
			case 3: sort = "pp"; break;
			case 4: sort = "date"; break;
		}
	}

	const ids = req.query.users.map(item => {
		if(_.isString(item)) {
			return _.parseInt(item, 10);
		}
		return 0;
	});

	const data = await getScores(res.locals.deta, sort);
	data.filter(row => _.includes(ids, _.parseInt(row.key, 10)));

	const ret: IResponseData<IScoresResponse> = {
		message: "Data retrieved successfully.",
		data: {
			scores: data.map(item => ({
				scoreId: _.parseInt(item.key, 10),
				user: item.user,
				score: item.score,
				pp: item.pp
			})),
			length: data.length
		}
	};

	res.status(HTTPStatus.OK).json(ret);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function addScore(req: Request, res: Response, next: NextFunction) {
	log(`Accessed: addScore, ${ res.locals.decode.clientId }`, LogLevel.LOG);
	const data: IScorePOSTData = req.body;

	if(!validateScorePostData(data)) {
		const ret: IResponseMessage = {
			message: "Invalid POST data."
		};

		res.status(HTTPStatus.BAD_REQUEST).json(ret);
		return;
	}

	{
		const user = await getUserByKey(res.locals.deta, data.userId);
		if(_.isNull(user)) {
			const ret: IResponseMessage = {
				message: "User with specified ID can't be found."
			};

			res.status(HTTPStatus.NOT_FOUND).json(ret);
			return;
		}
	}

	const result = await insertScore(res.locals.deta, data);

	if(!result) {
		const ret: IResponseMessage = {
			message: "Data insertion failed."
		};

		res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(ret);
		return;
	}

	const ret: IResponseMessage = {
		message: "Data inserted successfully."
	};

	res.status(HTTPStatus.OK).json(ret);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function deleteScore(req: Request, res: Response, next: NextFunction) {
	log(`Accessed: deleteScore, ${ res.locals.decode.clientId }`, LogLevel.LOG);
	const data: IScoreDELETEData = req.body;

	if(!validateScoreDeleteData(data)) {
		const ret: IResponseMessage = {
			message: "Invalid DELETE data."
		};

		res.status(HTTPStatus.BAD_REQUEST).json(ret);
		return;
	}

	{
		const score = await getScoreByKey(res.locals.deta, data.scoreId);
		if(_.isNull(score)) {
			const ret: IResponseMessage = {
				message: "Score with specified ID can't be found."
			};

			res.status(HTTPStatus.NOT_FOUND).json(ret);
			return;
		}
	}

	const result = await removeScore(res.locals.deta, data.scoreId);
	if(!result) {
		const ret: IResponseMessage = {
			message: "Data deletion failed."
		};

		res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(ret);
		return;
	}

	const ret: IResponseMessage = {
		message: "Data deleted successfully."
	};

	res.status(HTTPStatus.OK).json(ret);
}

function validateScorePostData(data: IScorePOSTData) {
	/* TODO: implement isDefined to all validations */

	const isDefined = !_.isUndefined(data.userId) && !_.isUndefined(data.score) && !_.isUndefined(data.pp);
	const hasValidTypes = _.isString(data.userId) && _.isNumber(data.score) && _.isNumber(data.pp);
	const hasValidData = isDefined && (!_.isEmpty(data.userId) && checkNumber(data.score) && checkNumber(data.pp));

	log(`validateUserPostData :: isDefined: ${ isDefined }, hasValidTypes: ${ hasValidTypes }, hasValidData: ${ hasValidData }`, LogLevel.DEBUG);

	return isDefined && hasValidTypes && hasValidData;
}

function validateScoreDeleteData(data: IScoreDELETEData) {
	const isDefined = !_.isUndefined(data.scoreId);
	const hasValidTypes = _.isNumber(data.scoreId);
	const hasValidData = isDefined && (checkNumber(data.scoreId));

	log(`validateUserPostData :: isDefined: ${ isDefined }, hasValidTypes: ${ hasValidTypes }, hasValidData: ${ hasValidData }`, LogLevel.DEBUG);

	return isDefined && hasValidTypes && hasValidData;
}
