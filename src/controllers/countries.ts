import { Request, Response } from "express";
import _ from "lodash";
import { ICountryDELETEData, ICountryPOSTData } from "../types/countries";
import { checkNumber } from "../utils/common";
import { HTTPStatus } from "../utils/http";

/* TODO: use JWT for actions other than GET */

export function getAllCountries(req: Request, res: Response) {
	console.log("[LOG] Accessed: getAllCountries");

	/* TODO: query all countries */
	const ret = {
		message: "Data retrieved successfully.",
		data: {
			countries: [
				{
					countryId: 1,
					countryName: "Country 1",
					osuId: 1
				},
				{
					countryId: 2,
					countryName: "Country 2",
					osuId: 2
				}
			],
			total: 2
		}
	};

	res.status(HTTPStatus.OK).json(ret);
}

export function getCountry(req: Request, res: Response) {
	console.log("[LOG] Accessed: getCountry");

	const id = _.parseInt(req.params.countryId, 10);

	if(!checkNumber(id)) {
		const ret = {
			message: "Invalid ID parameter."
		};

		res.status(HTTPStatus.BAD_REQUEST).json(ret);
		return;
	}

	/* TODO: query country information */
	const ret = {
		message: "Data retrieved successfully.",
		data: {
			country: {
				countryId: id,
				countryName: "Country 2",
				osuId: 3
			}
		}
	};

	res.status(HTTPStatus.OK).json(ret);
}

export function addCountry(req: Request, res: Response) {
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
	const ret = {
		message: "Data added successfully.",
		data: {
			submitted: {
				countryId: 3,
				countryName: data.countryName,
				osuId: data.osuId
			}
		}
	};

	res.status(HTTPStatus.OK).json(ret);
}

export function deleteCountry(req: Request, res: Response) {
	console.log("[LOG] Accessed: deleteCountry");

	const data: ICountryDELETEData = req.body;

	if(!validateCountryDeleteData(data)) {
		const ret = {
			message: "Invalid DELETE data."
		};

		res.status(HTTPStatus.BAD_REQUEST).json(ret);
		return;
	}

	/* TODO: delete scores and users from that country, and delete the country from database */
	const ret = {
		message: "Data deleted successfully.",
		data: {
			deleted: {
				countryId: 2,
				users: [
					{ userId: 1 },
					{ userId: 2 }
				]
			}
		}
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
	const hasValidTypes = checkNumber(data.countryName) && checkNumber(data.osuId);
	const hasValidData = !_.isEmpty(data.countryName) && data.osuId > 0;

	console.log(`[DEBUG] validateScorePostData :: hasValidTypes: ${ hasValidTypes }, hasValidData: ${ hasValidData }`);

	return hasValidTypes && hasValidData;
}

function validateCountryDeleteData(data: ICountryDELETEData) {
	const hasValidTypes = checkNumber(data.countryId);
	const hasValidData = data.countryId > 0;

	console.log(`[DEBUG] validateScorePostData :: hasValidTypes: ${ hasValidTypes }, hasValidData: ${ hasValidData }`);

	return hasValidTypes && hasValidData;
}
