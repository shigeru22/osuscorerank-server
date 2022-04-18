import { Request, Response, NextFunction } from "express";
import _ from "lodash";
import { IResponseData, IResponseMessage } from "../types/express";
import { IScoreDELETEData, IScorePOSTData, IScoreResponse, IScoresResponse } from "../types/score";
import { getCountryByKey } from "../utils/deta/countries";
import { getUserByKey } from "../utils/deta/users";
import { getScoreByKey, getScoreByUserId, getScores, getScoresByUpdateId, insertScore, removeScore } from "../utils/deta/scores";
import { HTTPStatus } from "../utils/http";
import { LogSeverity, log } from "../utils/log";
import { checkNumber } from "../utils/common";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getAllScores(req: Request, res: Response, next: NextFunction) {
	log("Function accessed.", "getAllScores", LogSeverity.LOG);

	let sort: "id" | "score" | "pp" | "date" = "score";
	{
		if(!_.isUndefined(req.query.sort)) {
			const id = _.parseInt(req.query.sort as string, 10);
			if(_.isNaN(id) || (id < 1 || id > 4)) {
				log("Invalid sort parameter. Sending error response.", "getAllScores", LogSeverity.WARN);

				const ret: IResponseMessage = {
					message: "Invalid sort parameter."
				};

				res.status(HTTPStatus.BAD_REQUEST).json(ret);
				return;
			}

			switch(id) {
				case 1: sort = "id"; break;
				case 3: sort = "pp"; break;
				case 4: sort = "date"; break;
			}
		}
	}

	let desc = false;
	{
		if(!_.isUndefined(req.query.desc)) {
			if(!_.isString(req.query.desc) || !(req.query.desc === "true" || req.query.desc === "false")) {
				log("Invalid desc parameter. Sending error response.", "getAllScores", LogSeverity.WARN);

				const ret: IResponseMessage = {
					message: "Invalid desc parameter."
				};

				res.status(HTTPStatus.BAD_REQUEST).json(ret);
				return;
			}

			if(req.query.desc === "true") {
				desc = true;
			}
		}
	}

	let update = 0;
	{
		if(!_.isUndefined(req.query.updateid)) {
			const id = _.parseInt(req.query.updateid as string, 10);
			if(_.isNaN(id) || (id <= 0)) {
				log("Invalid update ID parameter. Sending error response.", "getAllScores", LogSeverity.WARN);

				const ret: IResponseMessage = {
					message: "Invalid updateid parameter."
				};

				res.status(HTTPStatus.BAD_REQUEST).json(ret);
				return;
			}

			update = id;
		}
	}

	const data = await getScoresByUpdateId(res.locals.deta, update === 0 ? undefined : update, sort, desc);
	if(!data) {
		const ret: IResponseMessage = {
			message: "Failed to retrieve score data."
		};

		res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(ret);
		return;
	}

	if(data.length <= 0) {
		const ret: IResponseMessage = {
			message: "No data found."
		};

		res.status(HTTPStatus.NOT_FOUND).json(ret);
		return;
	}

	log("Scores data retrieved successfully. Sending data response.", "getAllScores", LogSeverity.LOG);

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
	log("Function accessed.", "getCountryScores", LogSeverity.LOG);

	let sort: "id" | "score" | "pp" | "date" = "score";
	{
		if(!_.isUndefined(req.query.sort)) {
			const id = _.parseInt(req.query.sort as string, 10);
			if(_.isNaN(id) || (id < 1 || id > 4)) {
				log("Invalid sort parameter. Sending error response.", "getCountryScores", LogSeverity.WARN);

				const ret: IResponseMessage = {
					message: "Invalid sort parameter."
				};

				res.status(HTTPStatus.BAD_REQUEST).json(ret);
				return;
			}

			switch(id) {
				case 1: sort = "id"; break;
				case 3: sort = "pp"; break;
				case 4: sort = "date"; break;
			}
		}
	}

	let desc = false;
	{
		if(!_.isUndefined(req.query.desc)) {
			if(!_.isString(req.query.desc) || !(req.query.desc === "true" || req.query.desc === "false")) {
				log("Invalid desc parameter. Sending error response.", "getCountryScores", LogSeverity.WARN);

				const ret: IResponseMessage = {
					message: "Invalid desc parameter."
				};

				res.status(HTTPStatus.BAD_REQUEST).json(ret);
				return;
			}

			if(req.query.desc === "true") {
				desc = true;
			}
		}
	}

	const id = _.parseInt(req.params.countryId, 10);
	if(!checkNumber(id) || id <= 0) {
		log("Invalid ID parameter. Sending error response.", "getCountryScores", LogSeverity.WARN);

		const ret: IResponseMessage = {
			message: "Invalid ID parameter."
		};

		res.status(HTTPStatus.BAD_REQUEST).json(ret);
		return;
	}

	{
		const country = await getCountryByKey(res.locals.deta, id);
		if(_.isNull(country)) {
			const ret: IResponseMessage = {
				message: "Country with specified ID not found."
			};

			res.status(HTTPStatus.NOT_FOUND).json(ret);
			return;
		}
	}

	const data = (await getScores(res.locals.deta, sort, desc)).filter(item => item.user.country.countryId === id);
	if(data.length <= 0) {
		const ret: IResponseMessage = {
			message: "No data found."
		};

		res.status(HTTPStatus.NOT_FOUND).json(ret);
		return;
	}

	log("Country scores data retrieved successfully. Sending data response.", "getMultipleUserScores", LogSeverity.LOG);

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
	log("Function accessed.", "getScore", LogSeverity.LOG);

	const id = _.parseInt(req.params.scoreId, 10);
	if(!checkNumber(id) || id <= 0) {
		log("Invalid ID parameter. Sending error message.", "getScore", LogSeverity.WARN);

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

	log("Score data retrieved successfully. Sending data response.", "getMultipleUserScores", LogSeverity.LOG);

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
	log("Function accessed.", "getUserScore", LogSeverity.LOG);

	const id = _.parseInt(req.params.userId, 10);
	if(!checkNumber(id) || id <= 0) {
		log("Invalid ID parameter. Sending error response.", "getUserScore", LogSeverity.WARN);

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

	log("Score data retrieved successfully. Sending data response.", "getMultipleUserScores", LogSeverity.LOG);

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
	log("Function accessed.", "getMultipleUserScores", LogSeverity.LOG);

	const sortQuery = _.parseInt(req.query.sort as string, 10);
	if(!_.isArray(req.query.users)) {
		log("Invalid users parameter. Sending error response.", "getMultipleUserScores", LogSeverity.WARN);

		const ret: IResponseMessage = {
			message: "Invalid users parameter."
		};

		res.status(HTTPStatus.BAD_REQUEST).json(ret);
		return;
	}

	if(req.query.users.length <= 0) {
		log("Invalid array length. Sending error response.", "getMultipleUserScores", LogSeverity.WARN);

		const ret: IResponseMessage = {
			message: "Invalid array length."
		};

		res.status(HTTPStatus.BAD_REQUEST).json(ret);
		return;
	}

	let sort: "id" | "score" | "pp" | "date" = "id";
	if(!_.isUndefined(req.query.sort)) {
		if(sortQuery < 1 || sortQuery > 4) {
			log("Invalid sort parameter. Sending error response.", "getMultipleUserScores", LogSeverity.WARN);

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

	let desc = false;
	{
		if(!_.isUndefined(req.query.desc)) {
			if(!_.isString(req.query.desc) || !(req.query.desc === "true" || req.query.desc === "false")) {
				log("Invalid desc parameter. Sending error response.", "getMultipleUserScores", LogSeverity.WARN);

				const ret: IResponseMessage = {
					message: "Invalid desc parameter."
				};

				res.status(HTTPStatus.BAD_REQUEST).json(ret);
				return;
			}

			if(req.query.desc === "true") {
				desc = true;
			}
		}
	}

	const ids = req.query.users.map(item => {
		if(_.isString(item)) {
			return _.parseInt(item, 10);
		}
		return 0;
	});

	const data = (await getScores(res.locals.deta, sort, desc)).filter(row => _.includes(ids, _.parseInt(row.key, 10)));

	log("Score data retrieved successfully. Sending data response.", "getMultipleUserScores", LogSeverity.LOG);

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
	log(`Function accessed, by clientId: ${ res.locals.decode.clientId }`, "addScore", LogSeverity.LOG);
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

	log("Score data inserted successfully. Sending success response.", "addScore", LogSeverity.LOG);

	const ret: IResponseMessage = {
		message: "Data inserted successfully."
	};

	res.status(HTTPStatus.OK).json(ret);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function deleteScore(req: Request, res: Response, next: NextFunction) {
	log(`Function accessed, by clientId: ${ res.locals.decode.clientId }`, "deleteScore", LogSeverity.LOG);
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

	log("Score data deleted successfully. Sending success response.", "removeScore", LogSeverity.LOG);

	const ret: IResponseMessage = {
		message: "Data deleted successfully."
	};

	res.status(HTTPStatus.OK).json(ret);
}

function validateScorePostData(data: IScorePOSTData) {
	const isDefined = !_.isUndefined(data.userId) && !_.isUndefined(data.score) && !_.isUndefined(data.pp);
	const hasValidTypes = _.isNumber(data.userId) && _.isNumber(data.score) && _.isNumber(data.pp);
	const hasValidData = isDefined && (checkNumber(data.userId) && checkNumber(data.score) && checkNumber(data.pp));

	log(`isDefined: ${ isDefined }, hasValidTypes: ${ hasValidTypes }, hasValidData: ${ hasValidData }`, "validateScorePostData", LogSeverity.DEBUG);
	if(!isDefined || !hasValidTypes || !hasValidData) {
		log("Invalid POST data found.", "validateScorePostData", LogSeverity.WARN);
	}

	return isDefined && hasValidTypes && hasValidData;
}

function validateScoreDeleteData(data: IScoreDELETEData) {
	const isDefined = !_.isUndefined(data.scoreId);
	const hasValidTypes = _.isNumber(data.scoreId);
	const hasValidData = isDefined && (checkNumber(data.scoreId));

	log(`isDefined: ${ isDefined }, hasValidTypes: ${ hasValidTypes }, hasValidData: ${ hasValidData }`, "validateScoreDeleteData", LogSeverity.DEBUG);
	if(!isDefined || !hasValidTypes || !hasValidData) {
		log("Invalid POST data found.", "validateScoreDeleteData", LogSeverity.WARN);
	}

	return isDefined && hasValidTypes && hasValidData;
}
