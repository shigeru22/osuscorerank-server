import { Request, Response, NextFunction } from "express";
import _ from "lodash";
import { IResponseData, IResponseMessage } from "../types/express";
import { ICountriesResponse, ICountryDELETEData, ICountryPOSTData, ICountryResponse } from "../types/country";
import { getCountries, getCountryByKey, insertCountry, removeCountry } from "../utils/deta/countries";
import { HTTPStatus } from "../utils/http";
import { LogLevel, log } from "../utils/log";
import { checkNumber } from "../utils/common";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getAllCountries(req: Request, res: Response, next: NextFunction) {
	log("Accessed: getAllCountries", LogLevel.LOG);

	const data = await getCountries(res.locals.deta);

	const ret: IResponseData<ICountriesResponse> = {
		message: "Data retrieved successfully.",
		data: {
			countries: data.map(item => ({
				countryId: parseInt(item.key, 10),
				countryName: item.countryName,
				countryCode: item.countryCode,
				recentlyInactive: item.recentlyInactive,
				highestId: item.highestId
			})),
			length: data.length
		}
	};

	res.status(HTTPStatus.OK).json(ret);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getCountry(req: Request, res: Response, next: NextFunction) {
	log("Accessed: getAllCountries", LogLevel.LOG);

	const id = _.parseInt(req.params.countryId, 10); // database's country id
	if(!checkNumber(id) || id <= 0) {
		const ret: IResponseMessage = {
			message: "Invalid ID parameter."
		};

		res.status(HTTPStatus.BAD_REQUEST).json(ret);
		return;
	}

	const data = await getCountryByKey(res.locals.deta, id);
	if(_.isNull(data)) {
		const ret: IResponseMessage = {
			message: "Country with specified ID can't be found."
		};

		res.status(HTTPStatus.NOT_FOUND).json(ret);
		return;
	}

	const ret: IResponseData<ICountryResponse> = {
		message: "Data retrieved successfully.",
		data: {
			country: {
				countryId: parseInt(data.key, 10),
				countryCode: data.countryCode,
				countryName: data.countryName,
				recentlyInactive: data.recentlyInactive,
				highestId: data.highestId
			}
		}
	};

	res.status(HTTPStatus.OK).json(ret);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function addCountry(req: Request, res: Response, next: NextFunction) {
	log(`Accessed: addCountry, clientId: ${ res.locals.decode.clientId }`, LogLevel.LOG);
	const data: ICountryPOSTData = req.body;

	if(!validateCountryPostData(data)) {
		const ret: IResponseMessage = {
			message: "Invalid POST data."
		};

		res.status(HTTPStatus.BAD_REQUEST).json(ret);
		return;
	}

	const result = await insertCountry(res.locals.deta, data);
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
export async function deleteCountry(req: Request, res: Response, next: NextFunction) {
	log(`Accessed: deleteCountry, clientId: ${ res.locals.decode.clientId }`, LogLevel.LOG);
	const data: ICountryDELETEData = req.body;

	if(!validateCountryDeleteData(data)) {
		const ret: IResponseMessage = {
			message: "Invalid DELETE data."
		};

		res.status(HTTPStatus.BAD_REQUEST).json(ret);
		return;
	}

	const country = await getCountryByKey(res.locals.deta, data.countryId);
	if(_.isNull(country)) {
		const ret: IResponseMessage = {
			message: "Country with specified ID can't be found."
		};

		res.status(HTTPStatus.NOT_FOUND).json(ret);
		return;
	}

	/* TODO: remove scores and users by country id */

	const result = await removeCountry(res.locals.deta, data.countryId);
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

function validateCountryPostData(data: ICountryPOSTData) {
	/* TODO: implement isDefined to all validations */

	const isDefined = !_.isUndefined(data.countryName) && !_.isUndefined(data.countryCode);
	const hasValidTypes = _.isString(data.countryName) && _.isString(data.countryCode);
	const hasValidData = isDefined && (!_.isEmpty(data.countryName) && data.countryCode.length === 2);

	log(`validateCountryPostData :: isDefined: ${ isDefined }, hasValidTypes: ${ hasValidTypes }, hasValidData: ${ hasValidData }`, LogLevel.DEBUG);

	return isDefined && hasValidTypes && hasValidData;
}

function validateCountryDeleteData(data: ICountryDELETEData) {
	const hasValidTypes = checkNumber(data.countryId);
	const hasValidData = data.countryId > 0;

	log(`validateCountryDeleteData :: hasValidTypes: ${ hasValidTypes }, hasValidData: ${ hasValidData }`, LogLevel.DEBUG);

	return hasValidTypes && hasValidData;
}
