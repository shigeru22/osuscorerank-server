import { Request, Response, NextFunction } from "express";
import Deta from "deta/dist/types/deta";
import _ from "lodash";
import { ICountriesResponse, ICountryPOSTData } from "../types/country";
import { IResponseData, IResponseMessage } from "../types/express";
import { getCountries, insertCountry } from "../utils/deta/countries";
import { HTTPStatus } from "../utils/http";
import { LogLevel, log } from "../utils/log";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getAllCountries(deta: Deta, req: Request, res: Response, next: NextFunction) {
	log("Accessed: getAllCountries", LogLevel.LOG);

	const data = await getCountries(deta);

	const ret: IResponseData<ICountriesResponse> = {
		message: "Data retrieved successfully.",
		data: {
			countries: data.map(item => ({
				countryName: item.countryName,
				countryCode: item.countryCode,
				recentlyInactive: item.recentlyInactive,
				highestId: item.highestId
			})),
			total: data.length
		}
	};

	res.status(HTTPStatus.OK).json(ret);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function addCountry(deta: Deta, req: Request, res: Response, next: NextFunction) {
	log("Accessed: addCountry", LogLevel.LOG);
	const data: ICountryPOSTData = req.body;

	if(!validateCountryPostData(data)) {
		const ret: IResponseMessage = {
			message: "Invalid POST data."
		};

		res.status(HTTPStatus.BAD_REQUEST).json(ret);
		return;
	}

	const result = await insertCountry(deta, data);

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

function validateCountryPostData(data: ICountryPOSTData) {
	/* TODO: implement isDefined to all validations */

	const isDefined = !_.isUndefined(data.countryName) && !_.isUndefined(data.countryCode);
	const hasValidTypes = _.isString(data.countryName) && _.isString(data.countryCode);
	const hasValidData = isDefined && (!_.isEmpty(data.countryName) && data.countryCode.length === 2);

	log(`validateScorePostData :: isDefined: ${ isDefined }, hasValidTypes: ${ hasValidTypes }, hasValidData: ${ hasValidData }`, LogLevel.DEBUG);

	return isDefined && hasValidTypes && hasValidData;
}
