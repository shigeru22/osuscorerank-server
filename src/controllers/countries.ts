import { Request, Response, NextFunction } from "express";
import _ from "lodash";
import { JwtPayload } from "jsonwebtoken";
import { ICountryDELETEData, ICountryPOSTData } from "../types/country";
import { removeAllScores, removeScoresByCountryId } from "../utils/prisma/scores";
import { removeAllUsers, removeUserByCountryId } from "../utils/prisma/users";
import { getCountries, getCountryById, insertCountry, removeAllCountries, removeCountry } from "../utils/prisma/countries";
import { checkNumber } from "../utils/common";
import { HTTPStatus } from "../utils/http";
import { LogLevel, log } from "../utils/log";

/* TODO: use JWT for actions other than GET */

export async function getAllCountries(req: Request, res: Response) {
	log("Accessed: getAllCountries", LogLevel.LOG);

	const data = await getCountries();

	const ret = {
		message: "Data retrieved successfully.",
		data: {
			countries: data,
			total: data.length
		}
	};

	res.status(HTTPStatus.OK).json(ret);
}

export async function getCountry(req: Request, res: Response) {
	log("Accessed: getCountry", LogLevel.LOG);

	const id = _.parseInt(req.params.countryId, 10); // database's country id

	if(!checkNumber(id)) {
		const ret = {
			message: "Invalid ID parameter."
		};

		res.status(HTTPStatus.BAD_REQUEST).json(ret);
		return;
	}

	const data = await getCountryById(id);

	if(_.isNull(data)) {
		const ret = {
			message: "Country with specified ID can't be found."
		};

		res.status(HTTPStatus.NOT_FOUND).json(ret);
		return;
	}

	const ret = {
		message: "Data retrieved successfully.",
		data: {
			country: data
		}
	};

	res.status(HTTPStatus.OK).json(ret);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function addCountry(decode: JwtPayload, req: Request, res: Response, next: NextFunction) {
	log(`Accessed: addCountry, Auth: ${ decode.clientId }`, LogLevel.LOG);

	const data: ICountryPOSTData = req.body;

	if(!validateCountryPostData(data)) {
		const ret = {
			message: "Invalid POST data."
		};

		res.status(HTTPStatus.BAD_REQUEST).json(ret);
		return;
	}

	const result = await insertCountry([ data ]);

	if(result <= 0) {
		const ret = {
			message: "Data insertion failed."
		};

		res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(ret);
		return;
	}

	const ret = {
		message: "Data inserted successfully."
	};

	res.status(HTTPStatus.OK).json(ret);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function deleteCountry(decode: JwtPayload, req: Request, res: Response, next: NextFunction) {
	log(`Accessed: deleteCountry, Auth: ${ decode.clientId }`, LogLevel.LOG);

	const data: ICountryDELETEData = req.body;

	if(!validateCountryDeleteData(data)) {
		const ret = {
			message: "Invalid DELETE data."
		};

		res.status(HTTPStatus.BAD_REQUEST).json(ret);
		return;
	}

	const country = await getCountryById(data.countryId);

	if(_.isNull(country)) {
		const ret = {
			message: "Country with specified ID can't be found."
		};

		res.status(HTTPStatus.NOT_FOUND).json(ret);
		return;
	}

	const resScores = await removeScoresByCountryId(data.countryId);

	if(resScores < 0) {
		const ret = {
			message: "Data deletion failed."
		};

		res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(ret);
		return;
	}

	const resUsers = await removeUserByCountryId(data.countryId);

	if(resUsers < 0) {
		const ret = {
			message: "Data deletion failed."
		};

		res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(ret);
		return;
	}

	const result = await removeCountry(data.countryId);

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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function resetCountries(decode: JwtPayload, req: Request, res: Response, next: NextFunction) {
	/* this essentially resets everything */

	log(`Accessed: resetCountries, Auth: ${ decode.clientId }`, LogLevel.LOG);

	const resScores = await removeAllScores();

	if(resScores <= 0) {
		const ret = {
			message: "Data deletion failed."
		};

		res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(ret);
		return;
	}

	const resUsers = await removeAllUsers();

	if(resUsers <= 0) {
		const ret = {
			message: "Data deletion failed."
		};

		res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(ret);
		return;
	}

	const resCountries = await removeAllCountries();

	if(resCountries <= 0) {
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

function validateCountryPostData(data: ICountryPOSTData) {
	const hasValidTypes = _.isString(data.countryName) && checkNumber(data.osuId);
	const hasValidData = !_.isEmpty(data.countryName) && data.osuId > 0;

	log(`validateScorePostData :: hasValidTypes: ${ hasValidTypes }, hasValidData: ${ hasValidData }`, LogLevel.DEBUG);

	return hasValidTypes && hasValidData;
}

function validateCountryDeleteData(data: ICountryDELETEData) {
	const hasValidTypes = checkNumber(data.countryId);
	const hasValidData = data.countryId > 0;

	log(`validateScorePostData :: hasValidTypes: ${ hasValidTypes }, hasValidData: ${ hasValidData }`, LogLevel.DEBUG);

	return hasValidTypes && hasValidData;
}
