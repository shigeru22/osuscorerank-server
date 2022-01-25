import { Request, Response } from "express";
import _ from "lodash";
import { IScorePOSTData, IScoreDELETEData } from "../types/score";
import { getCountryById } from "../utils/prisma/countries";
import { getScores, getScoresByCountryId, getScoreByUserId, insertScore, removeScore, removeAllScores } from "../utils/prisma/scores";
import { getUserById } from "../utils/prisma/users";
import { checkNumber } from "../utils/common";
import { HTTPStatus } from "../utils/http";

/* TODO: use JWT for actions other than GET */

export async function getAllScores(req: Request, res: Response) {
	console.log("[LOG] Accessed: getScoresByCountry");

	const data = await getScores();

	if(_.isEmpty(data)) {
		const ret = {
			message: "Empty rankings returned."
		};

		res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(ret);
		return;
	}

	const ret = {
		message: "Data retrieved successfully.",
		data: {
			scores: data,
			length: data.length
		}
	};

	res.status(HTTPStatus.OK).send(JSON.stringify(
		ret,
		(key, value) => (typeof value === "bigint" ? value.toString() : value) // return bigint as string
	));
}

export async function getCountryScores(req: Request, res: Response) {
	console.log("[LOG] Accessed: getCountryScores");

	const id = _.parseInt(req.params.countryId, 10); // database's country id

	if(!checkNumber(id)) {
		const ret = {
			message: "Invalid ID parameter."
		};

		res.status(HTTPStatus.BAD_REQUEST).json(ret);
		return;
	}

	const country = await getCountryById(id);

	if(_.isNull(country)) {
		const ret = {
			message: "Country with specified ID can't be found."
		};

		res.status(HTTPStatus.NOT_FOUND).json(ret);
		return;
	}

	const data = await getScoresByCountryId(id);

	if(_.isEmpty(data)) {
		const ret = {
			message: "Empty rankings returned."
		};

		res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(ret);
		return;
	}

	const ret = {
		message: "Data retrieved successfully.",
		data: {
			country: {
				countryId: id,
				countryName: country.countryName,
				osuId: country.osuId
			},
			rankings: data,
			total: data.length
		}
	};

	res.status(HTTPStatus.OK).send(JSON.stringify(
		ret,
		(key, value) => (typeof value === "bigint" ? value.toString() : value) // return bigint as string
	));
}

export async function getUserScore(req: Request, res: Response) {
	console.log("[LOG] Accessed: getUserScore");

	const id = _.parseInt(req.params.userId, 10); // database's user id

	if(!checkNumber(id)) {
		const ret = {
			message: "Invalid ID parameter."
		};

		res.status(HTTPStatus.BAD_REQUEST).json(ret);
		return;
	}

	const user = await getUserById(id);

	if(_.isNull(user)) {
		const ret = {
			message: "User with specified ID can't be found."
		};

		res.status(HTTPStatus.NOT_FOUND).json(ret);
		return;
	}

	const score = await getScoreByUserId(id);

	if(_.isNull(score)) {
		const ret = {
			message: "Null data returned."
		};

		res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(ret);
		return;
	}

	const ret = {
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

export async function addUserScore(req: Request, res: Response) {
	console.log("[LOG] Accessed: addUserScore");

	const data: IScorePOSTData = req.body;

	if(!validateScorePostData(data)) {
		const ret = {
			message: "Invalid POST data."
		};

		res.status(HTTPStatus.BAD_REQUEST).json(ret);
		return;
	}

	const result = await insertScore([ data ]);

	if(result <= 0) {
		const ret = {
			message: "Data insertion failed."
		};

		res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(ret);
		return;
	}

	const ret = {
		message: "Data added successfully."
	};

	res.status(HTTPStatus.OK).json(ret);
}

export async function deleteUserScore(req: Request, res: Response) {
	console.log("[LOG] Accessed: deleteUserScore");

	const data: IScoreDELETEData = req.body;

	if(!validateScoreDeleteData(data)) {
		const ret = {
			message: "Invalid DELETE data."
		};

		res.status(HTTPStatus.BAD_REQUEST).json(ret);
		return;
	}

	const result = await removeScore(data.scoreId);

	if(result !== 1) {
		const ret = {
			message: "Data deletion failed."
		};

		res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(ret);
		return;
	}

	const ret = {
		message: "Data deleted successfully."
	};

	res.status(HTTPStatus.OK).json(ret);
}

export async function resetScores(req: Request, res: Response) {
	console.log("[LOG] Accessed: resetScores");

	const result = await removeAllScores();

	if(result <= 0) {
		const ret = {
			message: "Data deletion failed."
		};

		res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(ret);
		return;
	}

	const ret = {
		message: "Data deleted successfully."
	};

	res.status(HTTPStatus.OK).json(ret);
}

function validateScorePostData(data: IScorePOSTData) {
	const hasValidTypes = checkNumber(data.userId) && checkNumber(data.score) && checkNumber(data.globalRank);
	const hasValidData = data.userId > 0 && data.score >= 0 && data.globalRank > 0;

	console.log(`[DEBUG] validateScorePostData :: hasValidTypes: ${ hasValidTypes }, hasValidData: ${ hasValidData }`);

	return hasValidTypes && hasValidData;
}

function validateScoreDeleteData(data: IScoreDELETEData) {
	const hasValidTypes = checkNumber(data.scoreId);
	const hasValidData = data.scoreId > 0;

	console.log(`[DEBUG] validateScoreDeleteData :: hasValidTypes: ${ hasValidTypes }, hasValidData: ${ hasValidData }`);

	return hasValidTypes && hasValidData;
}
