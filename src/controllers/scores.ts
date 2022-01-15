import { Request, Response } from "express";
import _ from "lodash";
import { checkNumber } from "../utils/common";
import { IScorePOSTData, IScoreDELETEData } from "../types/scores";

/* TODO: use JWT for actions other than GET */

export function getAllScores(req: Request, res: Response) {
	console.log("[LOG] Accessed: getScoresByCountry");

	/* TODO: query all scores from database */
	const ret = {
		message: "Data retrieved successfully.",
		data: {
			rankings: [
				{
					scoreId: 73,
					userId: 56,
					userName: "User 1",
					osuId: 2987165,
					score: 595876723879,
					globalRank: 2335
				},
				{
					scoreId: 29,
					userId: 109,
					userName: "User 8",
					osuId: 6198753,
					score: 587261987642,
					globalRank: 4356
				}
			],
			total: 2
		}
	};

	res.status(200).json(ret);
}

export function getScoresByCountry(req: Request, res: Response) {
	console.log("[LOG] Accessed: getScoresByCountry");

	const id = _.parseInt(req.params.countryId, 10); // database's country id

	if(!checkNumber(id)) {
		const ret = {
			message: "Invalid ID parameter."
		};

		res.status(400).json(ret);
		return;
	}

	/* TODO: query country scores */
	const ret = {
		message: "Data retrieved successfully.",
		data: {
			country: {
				countryId: id,
				countryName: "Country 2",
				osuId: 3
			},
			rankings: [
				{
					scoreId: 73,
					userId: 56,
					userName: "User 1",
					osuId: 2987165,
					score: 595876723879,
					globalRank: 2335
				},
				{
					scoreId: 29,
					userId: 109,
					userName: "User 8",
					osuId: 6198753,
					score: 587261987642,
					globalRank: 4356
				}
			],
			total: 2
		}
	};

	res.status(200).json(ret);
}

export function getScoreByUser(req: Request, res: Response) {
	console.log("[LOG] Accessed: getScoreByUser");

	const id = _.parseInt(req.params.userId, 10); // database's user id

	if(!checkNumber(id)) {
		const ret = {
			message: "Invalid ID parameter."
		};

		res.status(400).json(ret);
		return;
	}

	/* TODO: query user score */
	const ret = {
		message: "Data retrieved successfully.",
		data: {
			userData: {
				scoreId: 46,
				userId: id,
				userName: "User 5",
				countryId: 2,
				osuId: 1263488,
				score: 234680156234,
				globalRank: 3163
			}
		}
	};

	res.status(200).json(ret);
}

export function addUserScore(req: Request, res: Response) {
	console.log("[LOG] Accessed: addUserScore");

	const data: IScorePOSTData = req.body;

	if(!validateScorePostData(data)) {
		const ret = {
			message: "Invalid POST data."
		};

		res.status(400).json(ret);
		return;
	}

	/* TODO: add to database, check for existing data and validity */
	const ret = {
		message: "Data added successfully.",
		data: {
			submitted: {
				userId: 2,
				userName: data.userName,
				osuId: data.osuId,
				countryId: data.countryId,
				score: data.score,
				globalRank: data.globalRank
			}
		}
	};

	res.status(200).json(ret);
}

export function deleteUserScore(req: Request, res: Response) {
	console.log("[LOG] Accessed: deleteUserScore");

	const data: IScoreDELETEData = req.body;

	if(!validateScoreDeleteData(data)) {
		const ret = {
			message: "Invalid DELETE data."
		};

		res.status(400).json(ret);
		return;
	}

	/* TODO: delete from database */
	const ret = {
		message: "Data deleted successfully.",
		data: {
			deleted: {
				osuId: data.osuId
			}
		}
	};

	res.status(200).json(ret);
}

export function resetScores(req: Request, res: Response) {
	console.log("[LOG] Accessed: resetScores");

	/* TODO: delete all scores */
	const ret = {
		message: "Data deleted successfully."
	};

	res.status(200).json(ret);
}

function validateScorePostData(data: IScorePOSTData) {
	const hasValidTypes = _.isString(data.userName) && checkNumber(data.osuId) && checkNumber(data.countryId) && checkNumber(data.score) && checkNumber(data.globalRank);
	const hasValidData = !_.isEmpty(data.userName) && data.osuId > 0 && data.countryId > 0 && data.score >= 0 && data.globalRank > 0;

	console.log(`[DEBUG] validateScorePostData :: hasValidTypes: ${ hasValidTypes }, hasValidData: ${ hasValidData }`);

	return hasValidTypes && hasValidData;
}

function validateScoreDeleteData(data: IScoreDELETEData) {
	const hasValidTypes = checkNumber(data.osuId);
	const hasValidData = data.osuId > 0;

	console.log(`[DEBUG] validateScoreDeleteData :: hasValidTypes: ${ hasValidTypes }, hasValidData: ${ hasValidData }`);

	return hasValidTypes && hasValidData;
}
