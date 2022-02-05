import { Request, Response, NextFunction } from "express";
import _ from "lodash";
import { JwtPayload } from "jsonwebtoken";
import { IScorePOSTData, IScoreDELETEData, IGlobalScoreDeltaResponseData, IScoreDeltaResponseData, IGlobalRankingResponse, ICountryRankingResponse, IUserScoreResponse } from "../types/score";
import { IScoreInsertData } from "../types/prisma/score";
import { IResponseMessage, IResponseData } from "../types/express";
import { getCountryById } from "../utils/prisma/countries";
import { getScores, getScoresByCountryId, getScoreByUserId, insertScore, removeScore, removeAllScores } from "../utils/prisma/scores";
import { getUserById } from "../utils/prisma/users";
import { getRecentInactives } from "../utils/prisma/updates";
import { checkNumber } from "../utils/common";
import { HTTPStatus } from "../utils/http";
import { LogLevel, log } from "../utils/log";

export async function getAllScores(req: Request, res: Response) {
	log("Accessed: getScoresByCountry", LogLevel.LOG);

	const sortQuery = _.parseInt(req.query.sort as string, 10);

	if(!_.isUndefined(req.query.sort) && !validateSortQueryString(sortQuery)) {
		const ret: IResponseMessage = {
			message: "Invalid sort value."
		};

		res.status(HTTPStatus.BAD_REQUEST).json(ret);
		return;
	}

	let sort = 1;
	if(!_.isUndefined(req.query.sort)) {
		switch(sortQuery) {
			case 1: sort = 1; break;
			case 2: sort = 2; break;
			default: sort = 1;
		}
	}
	else {
		sort = 1;
	}

	const scores = await getScores(sort);

	if(_.isEmpty(scores)) {
		const ret: IResponseMessage = {
			message: "Empty rankings returned."
		};

		res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(ret);
		return;
	}

	const inactives = await getRecentInactives();

	if(_.isNull(inactives)) {
		const ret: IResponseMessage = {
			message: "Empty inactive record."
		};

		res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(ret);
		return;
	}

	const data: IGlobalScoreDeltaResponseData[] = scores.map((item, index) => ({
		scoreId: item.scoreId,
		user: {
			userId: item.user.userId,
			userName: item.user.userName,
			osuId: item.user.osuId,
			country: {
				countryId: item.user.country.countryId,
				countryName: item.user.country.countryName
			}
		},
		score: item.score,
		pp: item.pp,
		globalRank: item.globalRank,
		delta: (
			sort === 1 ? (!_.isNull(item.previousGlobalScoreRank) ? item.previousGlobalScoreRank - (index + 1) : 0) : (!_.isNull(item.previousGlobalPpRank) ? item.previousGlobalPpRank - (index + 1) : 0)
		)
	}));

	const ret: IResponseData<IGlobalRankingResponse> = {
		message: "Data retrieved successfully.",
		data: {
			rankings: data,
			inactives: {
				recentlyInactive: inactives.recentlyInactive,
				totalInactive: inactives.totalInactive
			},
			total: data.length
		}
	};

	res.status(HTTPStatus.OK).send(JSON.stringify(
		ret,
		(key, value) => (typeof value === "bigint" ? value.toString() : value) // return bigint as string
	));
}

export async function getCountryScores(req: Request, res: Response) {
	log("Accessed: getCountryScores", LogLevel.LOG);

	const id = _.parseInt(req.params.countryId, 10); // database's country id

	if(!checkNumber(id)) {
		const ret: IResponseMessage = {
			message: "Invalid ID parameter."
		};

		res.status(HTTPStatus.BAD_REQUEST).json(ret);
		return;
	}

	const sortQuery = _.parseInt(req.query.sort as string, 10);

	if(!_.isUndefined(req.query.sort) && !validateSortQueryString(sortQuery)) {
		const ret: IResponseMessage = {
			message: "Invalid sort value."
		};

		res.status(HTTPStatus.BAD_REQUEST).json(ret);
		return;
	}

	let sort = 1;
	if(!_.isUndefined(req.query.sort)) {
		switch(sortQuery) {
			case 1: sort = 1; break;
			case 2: sort = 2; break;
			default: sort = 1;
		}
	}
	else {
		sort = 1;
	}

	const country = await getCountryById(id);

	if(_.isNull(country)) {
		const ret: IResponseMessage = {
			message: "Country with specified ID can't be found."
		};

		res.status(HTTPStatus.NOT_FOUND).json(ret);
		return;
	}

	const scores = await getScoresByCountryId(id, sort);

	if(_.isEmpty(scores)) {
		const ret: IResponseMessage = {
			message: "Empty rankings returned."
		};

		res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(ret);
		return;
	}

	const data: IScoreDeltaResponseData[] = scores.map((item, index) => ({
		scoreId: item.scoreId,
		user: {
			userId: item.user.userId,
			userName: item.user.userName,
			osuId: item.user.osuId
		},
		score: item.score,
		pp: item.pp,
		globalRank: item.globalRank,
		delta: (
			sort === 1 ? (!_.isNull(item.previousScoreRank) ? item.previousScoreRank - (index + 1) : 0) : (!_.isNull(item.previousPpRank) ? item.previousPpRank - (index + 1) : 0)
		)
	}));

	const ret: IResponseData<ICountryRankingResponse> = {
		message: "Data retrieved successfully.",
		data: {
			country: {
				countryId: id,
				countryName: country.countryName
			},
			rankings: data,
			inactives: {
				recentlyInactive: country.recentlyInactive,
				totalInactive: country.totalInactive
			},
			total: data.length
		}
	};

	res.status(HTTPStatus.OK).send(JSON.stringify(
		ret,
		(key, value) => (typeof value === "bigint" ? value.toString() : value) // return bigint as string
	));
}

export async function getUserScore(req: Request, res: Response) {
	log("Accessed: getUserScore", LogLevel.LOG);

	const id = _.parseInt(req.params.userId, 10); // database's user id

	if(!checkNumber(id)) {
		const ret: IResponseMessage = {
			message: "Invalid ID parameter."
		};

		res.status(HTTPStatus.BAD_REQUEST).json(ret);
		return;
	}

	const user = await getUserById(id);

	if(_.isNull(user)) {
		const ret: IResponseMessage = {
			message: "User with specified ID can't be found."
		};

		res.status(HTTPStatus.NOT_FOUND).json(ret);
		return;
	}

	const score = await getScoreByUserId(id);

	if(_.isNull(score)) {
		const ret: IResponseMessage = {
			message: "Null data returned."
		};

		res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(ret);
		return;
	}

	const ret: IResponseData<IUserScoreResponse> = {
		message: "Data retrieved successfully.",
		data: {
			score: score
		}
	};

	res.status(HTTPStatus.OK).send(JSON.stringify(
		ret,
		(key, value) => (typeof value === "bigint" ? value.toString() : value) // return bigint as string
	));
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function addUserScore(decode: JwtPayload, req: Request, res: Response, next: NextFunction) {
	log(`Accessed: addUserScore, Auth: ${ decode.clientId }`, LogLevel.LOG);

	const data: IScorePOSTData = req.body;

	if(!validateScorePostData(data)) {
		const ret: IResponseMessage = {
			message: "Invalid POST data."
		};

		res.status(HTTPStatus.BAD_REQUEST).json(ret);
		return;
	}

	const score: IScoreInsertData = {
		userId: data.userId,
		score: data.score,
		pp: data.pp,
		globalRank: data.globalRank,
		previousPpRank: null,
		previousScoreRank: null,
		previousGlobalPpRank: null,
		previousGlobalScoreRank: null
	};

	const userScore = await getScoreByUserId(data.userId);

	if(!_.isNull(userScore)) {
		const user = await getUserById(data.userId);

		if(_.isNull(user)) {
			const ret: IResponseMessage = {
				message: "User with specified ID can't be found."
			};

			res.status(HTTPStatus.NOT_FOUND).json(ret);
			return;
		}

		const globalScoreRank = await getScores(1);
		const globalPpRank = await getScores(2);
		const countryScoreRank = await getScoresByCountryId(user.country.countryId, 1);
		const countryPpRank = await getScoresByCountryId(user.country.countryId, 2);

		score.previousScoreRank = countryScoreRank.findIndex(item => item.user.userId === user.userId);
		score.previousGlobalScoreRank = globalScoreRank.findIndex(item => item.user.userId === user.userId);
		score.previousPpRank = countryPpRank.findIndex(item => item.user.userId === user.userId);
		score.previousGlobalPpRank = globalPpRank.findIndex(item => item.user.userId === user.userId);

		const resDelete = await removeScore(userScore.scoreId);

		if(resDelete < 0) {
			const ret: IResponseMessage = {
				message: "Invalid record deletion."
			};

			res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(ret);
			return;
		}
	}

	const result = await insertScore([ score ]);

	if(result <= 0) {
		const ret: IResponseMessage = {
			message: "Data insertion failed."
		};

		res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(ret);
		return;
	}

	const ret: IResponseMessage = {
		message: "Data added successfully."
	};

	res.status(HTTPStatus.OK).json(ret);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function deleteUserScore(decode: JwtPayload, req: Request, res: Response, next: NextFunction) {
	log(`Accessed: deleteUserScore, Auth: ${ decode.clientId }`, LogLevel.LOG);

	const data: IScoreDELETEData = req.body;

	if(!validateScoreDeleteData(data)) {
		const ret: IResponseMessage = {
			message: "Invalid DELETE data."
		};

		res.status(HTTPStatus.BAD_REQUEST).json(ret);
		return;
	}

	const result = await removeScore(data.scoreId);

	if(result !== 1) {
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function resetScores(decode: JwtPayload, req: Request, res: Response, next: NextFunction) {
	log("Accessed: resetScores", LogLevel.LOG);

	const result = await removeAllScores();

	if(result <= 0) {
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
	const hasValidTypes = checkNumber(data.userId) && checkNumber(data.score) && checkNumber(data.globalRank);
	const hasValidData = data.userId > 0 && data.score >= 0 && data.globalRank > 0;

	log(`validateScorePostData :: hasValidTypes: ${ hasValidTypes }, hasValidData: ${ hasValidData }`, LogLevel.DEBUG);

	return hasValidTypes && hasValidData;
}

function validateScoreDeleteData(data: IScoreDELETEData) {
	const hasValidTypes = checkNumber(data.scoreId);
	const hasValidData = data.scoreId > 0;

	log(`validateScoreDeleteData :: hasValidTypes: ${ hasValidTypes }, hasValidData: ${ hasValidData }`, LogLevel.DEBUG);

	return hasValidTypes && hasValidData;
}

function validateSortQueryString(sort: unknown) {
	const hasValidTypes = checkNumber(sort);
	const hasValidData = _.isNumber(sort) && (sort >= 1 && sort <= 2);

	log(`validateScoreDeleteData :: hasValidTypes: ${ hasValidTypes }, hasValidData: ${ hasValidData }`, LogLevel.DEBUG);

	return hasValidTypes && hasValidData;
}
