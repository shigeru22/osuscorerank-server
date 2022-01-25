import { Request, Response } from "express";
import _ from "lodash";
import { ICountryDELETEData, ICountryPOSTData } from "../types/countries";
import { getCountries, getCountryById, insertCountry, removeCountry } from "../utils/prisma/db-operations";
import { checkNumber } from "../utils/common";
import { HTTPStatus } from "../utils/http";

/* TODO: use JWT for actions other than GET */

export async function getAllCountries(req: Request, res: Response) {
	console.log("[LOG] Accessed: getAllCountries");

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
	console.log("[LOG] Accessed: getCountry");

	const id = _.parseInt(req.params.countryId, 10);

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

export async function addCountry(req: Request, res: Response) {
	console.log("[LOG] Accessed: addCountry");

	const data: ICountryPOSTData = req.body;

	if(!validateCountryPostData(data)) {
		const ret = {
			message: "Invalid POST data."
		};

		res.status(HTTPStatus.BAD_REQUEST).json(ret);
		return;
	}

	/* TODO: add to database, check for existing data and validity */
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

export async function deleteCountry(req: Request, res: Response) {
	console.log("[LOG] Accessed: deleteCountry");

	const data: ICountryDELETEData = req.body;

	if(!validateCountryDeleteData(data)) {
		const ret = {
			message: "Invalid DELETE data."
		};

		res.status(HTTPStatus.BAD_REQUEST).json(ret);
		return;
	}

	/* TODO: delete scores from that country too */
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

export function resetCountries(req: Request, res: Response) {
	/* this essentially resets everything */

	console.log("[LOG] Accessed: resetCountries");

	/* TODO: delete all scores, then users, and lastly, countries from database */
	const ret = {
		message: "Data deleted successfully."
	};

	res.status(HTTPStatus.OK).json(ret);
}

function validateCountryPostData(data: ICountryPOSTData) {
	const hasValidTypes = _.isString(data.countryName) && checkNumber(data.osuId);
	const hasValidData = !_.isEmpty(data.countryName) && data.osuId > 0;

	console.log(`[DEBUG] countryName: ${ data.osuId }`);

	console.log(`[DEBUG] validateScorePostData :: hasValidTypes: ${ hasValidTypes }, hasValidData: ${ hasValidData }`);

	return hasValidTypes && hasValidData;
}

function validateCountryDeleteData(data: ICountryDELETEData) {
	const hasValidTypes = checkNumber(data.countryId);
	const hasValidData = data.countryId > 0;

	console.log(`[DEBUG] validateScorePostData :: hasValidTypes: ${ hasValidTypes }, hasValidData: ${ hasValidData }`);

	return hasValidTypes && hasValidData;
}
