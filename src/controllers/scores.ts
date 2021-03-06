import { Request, Response, NextFunction } from "express";
import _ from "lodash";
import { IResponseData, IResponseMessage } from "../types/express";
import { ICountryScoresResponse, IScoreDELETEData, IScorePOSTData, IScoreResponse, IScoresResponse } from "../types/score";
import { getCountryByKey } from "../utils/deta/countries";
import { getUserByKey } from "../utils/deta/users";
import { getScoreByKey, getScoreByUserId, getScores, getScoresByCountryId, getScoresByUpdateId, insertScore, removeScore } from "../utils/deta/scores";
import { getUpdateByKey } from "../utils/deta/updates";
import { CountryGetStatus, UserGetStatus, ScoreGetStatus, ScoreInsertStatus, ScoreDeleteStatus, UpdateGetStatus } from "../utils/status";
import { HTTPStatus } from "../utils/http";
import { LogSeverity, log } from "../utils/log";
import { checkNumber } from "../utils/common";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getAllScores(req: Request, res: Response, next: NextFunction) {
	log("Function accessed.", "getAllScores", LogSeverity.LOG);

	let isActive: boolean | null = null;
	{
		if(!_.isUndefined(req.query.active)) {
			if(!_.isString(req.query.active) || !(req.query.active === "true" || req.query.active === "false" || req.query.active === "all")) {
				log("Invalid active parameter. Sending error response.", "getAllScores", LogSeverity.WARN);

				const ret: IResponseMessage = {
					message: "Invalid active parameter."
				};

				res.status(HTTPStatus.BAD_REQUEST).json(ret);
				return;
			}

			switch(req.query.active) {
				case "true": isActive = true; break;
				case "false": isActive = false; break;
			}
		}
	}

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

	const data = await getScoresByUpdateId(res.locals.deta, isActive, update === 0 ? undefined : update, sort, desc);
	if(data === ScoreGetStatus.INTERNAL_ERROR) {
		const ret: IResponseMessage = {
			message: "Data query failed."
		};

		res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(ret);
		return;
	}
	else if(data === ScoreGetStatus.NO_ONLINE_UPDATE_DATA) {
		const ret: IResponseMessage = {
			message: "No online update data."
		};

		res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(ret);
		return;
	}
	else if(data === ScoreGetStatus.INVALID_UPDATE_ID) {
		const ret: IResponseMessage = {
			message: "Invalid update ID."
		};

		res.status(HTTPStatus.BAD_REQUEST).json(ret);
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
				user: {
					userId: item.user.userId,
					userName: item.user.userName,
					osuId: item.user.osuId,
					isActive: item.user.isActive,
					country: {
						countryId: item.user.country.countryId,
						countryName: item.user.country.countryName,
						countryCode: item.user.country.countryCode
					}
				},
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

	let isActive: boolean | null = null;
	{
		if(!_.isUndefined(req.query.active)) {
			if(!_.isString(req.query.active) || !(req.query.active === "true" || req.query.active === "false" || req.query.active === "all")) {
				log("Invalid active parameter. Sending error response.", "getCountryScores", LogSeverity.WARN);

				const ret: IResponseMessage = {
					message: "Invalid active parameter."
				};

				res.status(HTTPStatus.BAD_REQUEST).json(ret);
				return;
			}

			switch(req.query.active) {
				case "true": isActive = true; break;
				case "false": isActive = false; break;
			}
		}
	}

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

	let update: number | undefined = undefined;
	{
		if(!_.isUndefined(req.query.updateid)) {
			const id = _.parseInt(req.query.updateid as string, 10);
			if(_.isNaN(id) || (id <= 0)) {
				log("Invalid update ID parameter. Sending error response.", "getCountryScores", LogSeverity.WARN);

				const ret: IResponseMessage = {
					message: "Invalid updateid parameter."
				};

				res.status(HTTPStatus.BAD_REQUEST).json(ret);
				return;
			}

			update = id;
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

	const country = await getCountryByKey(res.locals.deta, id);
	{
		if(country === CountryGetStatus.INTERNAL_ERROR) {
			const ret: IResponseMessage = {
				message: "Data query failed."
			};

			res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(ret);
			return;
		}
		else if(country === CountryGetStatus.NO_DATA) {
			const ret: IResponseMessage = {
				message: "Country with specified ID not found."
			};

			res.status(HTTPStatus.NOT_FOUND).json(ret);
			return;
		}
	}

	const data = await getScoresByCountryId(res.locals.deta, isActive, id, update, sort, desc);
	if(data === ScoreGetStatus.INTERNAL_ERROR) {
		const ret: IResponseMessage = {
			message: "Data query failed."
		};

		res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(ret);
		return;
	}
	else if(data === ScoreGetStatus.NO_ONLINE_UPDATE_DATA) {
		const ret: IResponseMessage = {
			message: "No online update data."
		};

		res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(ret);
		return;
	}
	else if(data === ScoreGetStatus.INVALID_UPDATE_ID) {
		const ret: IResponseMessage = {
			message: "Invalid update ID."
		};

		res.status(HTTPStatus.BAD_REQUEST).json(ret);
		return;
	}

	if(data.length <= 0) {
		const ret: IResponseMessage = {
			message: "No data found."
		};

		res.status(HTTPStatus.NOT_FOUND).json(ret);
		return;
	}

	log("Country scores data retrieved successfully. Sending data response.", "getCountryScores", LogSeverity.LOG);

	const ret: IResponseData<ICountryScoresResponse> = {
		message: "Data retrieved successfully.",
		data: {
			country: {
				countryId: _.parseInt(country.key, 10),
				countryName: country.countryName,
				countryCode: country.countryCode
			},
			scores: data.map(item => ({
				scoreId: _.parseInt(item.key, 10),
				user: {
					userId: item.user.userId,
					userName: item.user.userName,
					osuId: item.user.osuId,
					isActive: item.user.isActive
				},
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
	if(data === ScoreGetStatus.INTERNAL_ERROR) {
		const ret: IResponseMessage = {
			message: "Data query failed."
		};

		res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(ret);
		return;
	}
	else if(data === ScoreGetStatus.NO_DATA) {
		const ret: IResponseMessage = {
			message: "Score with specified ID not found."
		};

		res.status(HTTPStatus.NOT_FOUND).json(ret);
		return;
	}

	log("Score data retrieved successfully. Sending data response.", "getScore", LogSeverity.LOG);

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

	let update: number | undefined = undefined;
	{
		if(!_.isUndefined(req.query.updateid)) {
			const id = _.parseInt(req.query.updateid as string, 10);
			if(_.isNaN(id) || (id <= 0)) {
				log("Invalid update ID parameter. Sending error response.", "getUserScore", LogSeverity.WARN);

				const ret: IResponseMessage = {
					message: "Invalid updateid parameter."
				};

				res.status(HTTPStatus.BAD_REQUEST).json(ret);
				return;
			}

			update = id;
		}
	}

	{
		const user = await getUserByKey(res.locals.deta, id);
		if(user === UserGetStatus.INTERNAL_ERROR) {
			const ret: IResponseMessage = {
				message: "Data query failed."
			};

			res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(ret);
			return;
		}
		else if(user === UserGetStatus.NO_DATA) {
			const ret: IResponseMessage = {
				message: "User with specified ID not found."
			};

			res.status(HTTPStatus.NOT_FOUND).json(ret);
			return;
		}
	}

	const data = await getScoreByUserId(res.locals.deta, id, update);
	if(data === ScoreGetStatus.INTERNAL_ERROR) {
		const ret: IResponseMessage = {
			message: "Data query failed."
		};

		res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(ret);
		return;
	}
	else if(data === ScoreGetStatus.NO_ONLINE_UPDATE_DATA) {
		const ret: IResponseMessage = {
			message: "No online update data."
		};

		res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(ret);
		return;
	}
	else if(data === ScoreGetStatus.INVALID_UPDATE_ID) {
		const ret: IResponseMessage = {
			message: "Invalid update ID."
		};

		res.status(HTTPStatus.BAD_REQUEST).json(ret);
		return;
	}
	else if(data === ScoreGetStatus.DATA_TOO_MANY) {
		const ret: IResponseMessage = {
			message: "Multiple data found."
		};

		res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(ret);
		return;
	}
	else if(data === ScoreGetStatus.NO_DATA) {
		const ret: IResponseMessage = {
			message: "Score with specified ID not found."
		};

		res.status(HTTPStatus.NOT_FOUND).json(ret);
		return;
	}

	log("Score data retrieved successfully. Sending data response.", "getUserScore", LogSeverity.LOG);

	const ret: IResponseData<IScoreResponse> = {
		message: "Data retrieved successfully.",
		data: {
			score: {
				scoreId: _.parseInt(data.key, 10),
				user: {
					userId: data.user.userId,
					userName: data.user.userName,
					osuId: data.user.osuId,
					isActive: data.user.isActive,
					country: {
						countryId: data.user.country.countryId,
						countryName: data.user.country.countryName,
						countryCode: data.user.country.countryCode
					}
				},
				score: data.score,
				pp: data.pp
			}
		}
	};

	res.status(HTTPStatus.OK).json(ret);
	return;
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

	let update = 0;
	{
		if(!_.isUndefined(req.query.updateid)) {
			const id = _.parseInt(req.query.updateid as string, 10);
			if(_.isNaN(id) || (id <= 0)) {
				log("Invalid update ID parameter. Sending error response.", "getMultipleUserScores", LogSeverity.WARN);

				const ret: IResponseMessage = {
					message: "Invalid updateid parameter."
				};

				res.status(HTTPStatus.BAD_REQUEST).json(ret);
				return;
			}

			update = id;
		}
	}

	const ids = req.query.users.map(item => {
		if(_.isString(item)) {
			return _.parseInt(item, 10);
		}
		return 0;
	});

	const queryResult = (update === 0 ? (await getScores(res.locals.deta, null, sort, desc)) : (await getScoresByUpdateId(res.locals.deta, null, update, sort, desc)));
	if(queryResult === ScoreGetStatus.INTERNAL_ERROR) {
		const ret: IResponseMessage = {
			message: "Data query failed."
		};

		res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(ret);
		return;
	}
	else if(queryResult === ScoreGetStatus.NO_ONLINE_UPDATE_DATA) {
		const ret: IResponseMessage = {
			message: "No online update data."
		};

		res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(ret);
		return;
	}
	else if(queryResult === ScoreGetStatus.INVALID_UPDATE_ID) {
		const ret: IResponseMessage = {
			message: "Invalid update ID."
		};

		res.status(HTTPStatus.BAD_REQUEST).json(ret);
		return;
	}

	const data = queryResult.filter(row => _.includes(ids, _.parseInt(row.key, 10)));

	log("Score data retrieved successfully. Sending data response.", "getMultipleUserScores", LogSeverity.LOG);

	const ret: IResponseData<IScoresResponse> = {
		message: "Data retrieved successfully.",
		data: {
			scores: data.map(item => ({
				scoreId: _.parseInt(item.key, 10),
				user: {
					userId: item.user.userId,
					userName: item.user.userName,
					osuId: item.user.osuId,
					isActive: item.user.isActive,
					country: {
						countryId: item.user.country.countryId,
						countryName: item.user.country.countryName,
						countryCode: item.user.country.countryCode
					}
				},
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
		if(user === UserGetStatus.INTERNAL_ERROR) {
			const ret: IResponseMessage = {
				message: "Data query failed."
			};

			res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(ret);
			return;
		}
		else if(user === UserGetStatus.NO_DATA) {
			const ret: IResponseMessage = {
				message: "User with specified ID not found."
			};

			res.status(HTTPStatus.NOT_FOUND).json(ret);
			return;
		}
	}

	const result = await insertScore(res.locals.deta, data);

	if(result === ScoreInsertStatus.INTERNAL_ERROR) {
		const ret: IResponseMessage = {
			message: "Data insertion failed."
		};

		res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(ret);
		return;
	}
	else if(result === ScoreInsertStatus.NO_OFFLINE_UPDATE_DATA) {
		const ret: IResponseMessage = {
			message: "No offline update data found."
		};

		res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(ret);
		return;
	}
	else if(result === ScoreInsertStatus.NO_UPDATE_DATA) {
		const ret: IResponseMessage = {
			message: "Update data with specified ID not found."
		};

		res.status(HTTPStatus.BAD_REQUEST).json(ret);
		return;
	}
	else if(result === ScoreInsertStatus.UPDATE_DATA_FINALIZED) {
		const ret: IResponseMessage = {
			message: "Update data with specified ID is already online."
		};

		res.status(HTTPStatus.BAD_REQUEST).json(ret);
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

	const score = await getScoreByKey(res.locals.deta, data.scoreId);
	{
		if(score === ScoreGetStatus.INTERNAL_ERROR) {
			const ret: IResponseMessage = {
				message: "Data query failed."
			};

			res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(ret);
			return;
		}
		else if(score === ScoreGetStatus.NO_DATA) {
			const ret: IResponseMessage = {
				message: "Score with specified ID not found."
			};

			res.status(HTTPStatus.NOT_FOUND).json(ret);
			return;
		}
	}

	{
		const update = await getUpdateByKey(res.locals.deta, score.updateId);
		if(update === UpdateGetStatus.INTERNAL_ERROR) {
			const ret: IResponseMessage = {
				message: "Data query failed."
			};

			res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(ret);
			return;
		}
		else if(update === UpdateGetStatus.NO_DATA) {
			const ret: IResponseMessage = {
				message: "Update data with specified ID not found."
			};

			log(`Score with key ${ data.scoreId } contains invalid update ID. Fix this and try again.`, "deleteScore", LogSeverity.ERROR);
			res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(ret);
			return;
		}

		if(update.online) {
			const ret: IResponseMessage = {
				message: "Update data status for requested score is already online."
			};

			log(`Score with key ${ data.scoreId } can't be deleted: Update ID ${ update.key } is online.`, "deleteScore", LogSeverity.ERROR);
			res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(ret);
			return;
		}
	}

	const result = await removeScore(res.locals.deta, data.scoreId);

	if(result === ScoreDeleteStatus.INTERNAL_ERROR) {
		const ret: IResponseMessage = {
			message: "Data deletion failed."
		};

		res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(ret);
		return;
	}

	log("Score data deleted successfully. Sending success response.", "deleteScore", LogSeverity.LOG);

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
