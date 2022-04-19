import { Request, Response, NextFunction } from "express";
import _ from "lodash";
import { IResponseData, IResponseMessage } from "../types/express";
import { ICountryUsersResponse, IUserDELETEData, IUserPOSTData, IUserPUTData, IUserResponse, IUsersResponse } from "../types/user";
import { getCountryByKey } from "../utils/deta/countries";
import { getUserByKey, getUserByOsuId, getUsers, getUsersByCountryId, insertUser, removeUser, updateUser as updateUserData } from "../utils/deta/users";
import { HTTPStatus } from "../utils/http";
import { LogSeverity, log } from "../utils/log";
import { checkNumber } from "../utils/common";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getAllUsers(req: Request, res: Response, next: NextFunction) {
	log("Function accessed.", "getAllUsers", LogSeverity.LOG);

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

	let isActive: boolean | null = null;
	{
		if(!_.isUndefined(req.query.active)) {
			if(!_.isString(req.query.active) || !(req.query.active === "true" || req.query.active === "false" || req.query.active === "all")) {
				log("Invalid active parameter. Sending error response.", "getAllUsers", LogSeverity.WARN);

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

	const data = await getUsers(res.locals.deta, isActive, "id", desc);
	if(data.length <= 0) {
		const ret: IResponseMessage = {
			message: "No data found."
		};

		res.status(HTTPStatus.NOT_FOUND).json(ret);
		return;
	}

	log("Users data retrieved successfully. Sending data response.", "getAllUsers", LogSeverity.LOG);

	const ret: IResponseData<IUsersResponse> = {
		message: "Data retrieved successfully.",
		data: {
			users: data.map(item => ({
				userId: _.parseInt(item.key, 10),
				userName: item.userName,
				osuId: item.osuId,
				isActive: item.isActive,
				country: item.country
			})),
			length: data.length
		}
	};

	res.status(HTTPStatus.OK).json(ret);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getCountryUsers(req: Request, res: Response, next: NextFunction) {
	log("Function accessed.", "getCountryUsers", LogSeverity.LOG);

	const id = _.parseInt(req.params.countryId, 10);
	if(!checkNumber(id) || id <= 0) {
		log("Invalid ID parameter. Sending error response.", "getCountryUsers", LogSeverity.WARN);

		const ret: IResponseMessage = {
			message: "Invalid ID parameter."
		};

		res.status(HTTPStatus.BAD_REQUEST).json(ret);
		return;
	}

	let isActive: boolean | null = null;
	{
		if(!_.isUndefined(req.query.active)) {
			if(!_.isString(req.query.active) || !(req.query.active === "true" || req.query.active === "false" || req.query.active === "all")) {
				log("Invalid active parameter. Sending error response.", "getCountryUsers", LogSeverity.WARN);

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

	let desc = false;
	{
		if(!_.isUndefined(req.query.desc)) {
			if(!_.isString(req.query.desc) || !(req.query.desc === "true" || req.query.desc === "false")) {
				log("Invalid desc parameter. Sending error response.", "getCountryUsers", LogSeverity.WARN);

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

	const country = await getCountryByKey(res.locals.deta, id);
	if(_.isNull(country)) {
		const ret: IResponseMessage = {
			message: "Country with specified ID not found."
		};

		res.status(HTTPStatus.NOT_FOUND).json(ret);
		return;
	}

	const data = await getUsersByCountryId(res.locals.deta, isActive, id, "id", desc);
	if(data.length <= 0) {
		const ret: IResponseMessage = {
			message: "No data found."
		};

		res.status(HTTPStatus.NOT_FOUND).json(ret);
		return;
	}

	log("Users data retrieved successfully. Sending data response.", "getCountryUsers", LogSeverity.LOG);

	const ret: IResponseData<ICountryUsersResponse> = {
		message: "Data retrieved successfully.",
		data: {
			country: {
				countryId: _.parseInt(country.key, 10),
				countryName: country.countryName,
				countryCode: country.countryCode
			},
			users: data.map(item => ({
				userId: _.parseInt(item.key, 10),
				userName: item.userName,
				osuId: item.osuId,
				isActive: item.isActive
			})),
			length: data.length
		}
	};

	res.status(HTTPStatus.OK).json(ret);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getUser(req: Request, res: Response, next: NextFunction) {
	log("Function accessed.", "getUser", LogSeverity.LOG);

	const id = _.parseInt(req.params.userId, 10); // database's user id
	if(!checkNumber(id) || id <= 0) {
		log("Invalid ID parameter. Sending error response.", "getUser", LogSeverity.WARN);

		const ret: IResponseMessage = {
			message: "Invalid ID parameter."
		};

		res.status(HTTPStatus.BAD_REQUEST).json(ret);
		return;
	}

	const data = await getUserByKey(res.locals.deta, id);
	if(_.isNull(data)) {
		const ret: IResponseMessage = {
			message: "User with specified ID not found."
		};

		res.status(HTTPStatus.NOT_FOUND).json(ret);
		return;
	}

	log("User data retrieved successfully. Sending data response.", "getUser", LogSeverity.LOG);

	const ret: IResponseData<IUserResponse> = {
		message: "Data retrieved successfully.",
		data: {
			user: {
				userId: _.parseInt(data.key, 10),
				userName: data.userName,
				osuId: data.osuId,
				isActive: data.isActive,
				country: data.country
			}
		}
	};

	res.status(HTTPStatus.OK).json(ret);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function addUser(req: Request, res: Response, next: NextFunction) {
	log(`Function accessed, by clientId: ${ res.locals.decode.clientId }`, "addUser", LogSeverity.LOG);
	const data: IUserPOSTData = req.body;

	if(!validateUserPostData(data)) {
		const ret: IResponseMessage = {
			message: "Invalid POST data."
		};

		res.status(HTTPStatus.BAD_REQUEST).json(ret);
		return;
	}

	{
		const user = await getUserByOsuId(res.locals.deta, data.osuId);
		if(!_.isNull(user)) {
			const ret: IResponseMessage = {
				message: "The specified osu! ID has been exist by another user."
			};

			res.status(HTTPStatus.CONFLICT).json(ret);
			return;
		}
	}

	{
		const country = await getCountryByKey(res.locals.deta, data.countryId);
		if(_.isNull(country)) {
			const ret: IResponseMessage = {
				message: "Country with specified ID not found."
			};

			res.status(HTTPStatus.NOT_FOUND).json(ret);
			return;
		}
	}

	const result = await insertUser(res.locals.deta, data);

	if(!result) {
		const ret: IResponseMessage = {
			message: "Data insertion failed."
		};

		res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(ret);
		return;
	}

	log("User data inserted successfully. Sending data response.", "addUser", LogSeverity.LOG);

	const ret: IResponseMessage = {
		message: "Data inserted successfully."
	};

	res.status(HTTPStatus.OK).json(ret);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function updateUser(req: Request, res: Response, next: NextFunction) {
	log(`Function accessed, by clientId: ${ res.locals.decode.clientId }`, "updateUser", LogSeverity.LOG);
	const data: IUserPUTData = req.body;

	if(!validateUserPutData(data)) {
		const ret: IResponseMessage = {
			message: "Invalid PUT data."
		};

		res.status(HTTPStatus.BAD_REQUEST).json(ret);
		return;
	}

	{
		const user = await getUserByKey(res.locals.deta, data.userId);
		if(_.isNull(user)) {
			const ret: IResponseMessage = {
				message: "User with specified ID not found."
			};

			res.status(HTTPStatus.NOT_FOUND).json(ret);
			return;
		}
	}

	{
		const country = await getCountryByKey(res.locals.deta, data.countryId);
		if(_.isNull(country)) {
			const ret: IResponseMessage = {
				message: "Country with specified ID not found."
			};

			res.status(HTTPStatus.NOT_FOUND).json(ret);
			return;
		}
	}

	const result = await updateUserData(res.locals.deta, data);

	if(!result) {
		const ret: IResponseMessage = {
			message: "Data update failed."
		};

		res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(ret);
		return;
	}

	log("User data updated successfully. Sending data response.", "updateUser", LogSeverity.LOG);

	const ret: IResponseMessage = {
		message: "Data updated successfully."
	};

	res.status(HTTPStatus.OK).json(ret);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function deleteUser(req: Request, res: Response, next: NextFunction) {
	log(`Function accessed, by clientId: ${ res.locals.decode.clientId }`, "deleteUser", LogSeverity.LOG);
	const data: IUserDELETEData = req.body;

	if(!validateUserDeleteData(data)) {
		const ret: IResponseMessage = {
			message: "Invalid DELETE data."
		};

		res.status(HTTPStatus.BAD_REQUEST).json(ret);
		return;
	}

	{
		const user = await getUserByKey(res.locals.deta, data.userId);
		if(_.isNull(user)) {
			const ret: IResponseMessage = {
				message: "User with specified ID not found."
			};

			res.status(HTTPStatus.NOT_FOUND).json(ret);
			return;
		}
	}

	/* TODO: remove scores by user id */

	const result = await removeUser(res.locals.deta, data.userId);
	if(!result) {
		const ret: IResponseMessage = {
			message: "Data deletion failed."
		};

		res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(ret);
		return;
	}

	log("User data deleted successfully. Sending data response.", "deleteUser", LogSeverity.LOG);

	const ret: IResponseMessage = {
		message: "Data deleted successfully."
	};

	res.status(HTTPStatus.OK).json(ret);
}

function validateUserPostData(data: IUserPOSTData) {
	const isDefined = !_.isUndefined(data.userName) && !_.isUndefined(data.osuId) && !_.isUndefined(data.countryId) && !_.isUndefined(data.isActive);
	const hasValidTypes = _.isString(data.userName) && _.isNumber(data.osuId) && _.isNumber(data.countryId) && _.isBoolean(data.isActive);
	const hasValidData = isDefined && (!_.isEmpty(data.userName) && checkNumber(data.osuId) && checkNumber(data.countryId)); // boolean values are checked at isDefined

	log(`isDefined: ${ isDefined }, hasValidTypes: ${ hasValidTypes }, hasValidData: ${ hasValidData }`, "validateUserPostData", LogSeverity.DEBUG);
	if(!isDefined || !hasValidTypes || !hasValidData) {
		log("Invalid POST data found.", "validateUserPostData", LogSeverity.WARN);
	}

	return isDefined && hasValidTypes && hasValidData;
}

function validateUserPutData(data: IUserPUTData) {
	const isDefined = !_.isUndefined(data.userId) && !_.isUndefined(data.userName) && !_.isUndefined(data.countryId) && !_.isUndefined(data.isActive);
	const hasValidTypes = _.isNumber(data.userId) && _.isString(data.userName) && _.isNumber(data.countryId) && _.isBoolean(data.isActive);
	const hasValidData = isDefined && (checkNumber(data.userId) && !_.isEmpty(data.userName) && checkNumber(data.countryId)); // boolean values are checked at isDefined

	log(`isDefined: ${ isDefined }, hasValidTypes: ${ hasValidTypes }, hasValidData: ${ hasValidData }`, "validateUserPutData", LogSeverity.DEBUG);
	if(!isDefined || !hasValidTypes || !hasValidData) {
		log("Invalid POST data found.", "validateUserPutData", LogSeverity.WARN);
	}

	return isDefined && hasValidTypes && hasValidData;
}

function validateUserDeleteData(data: IUserDELETEData) {
	const isDefined = !_.isUndefined(data.userId);
	const hasValidTypes = _.isNumber(data.userId);
	const hasValidData = isDefined && (checkNumber(data.userId));

	log(`isDefined: ${ isDefined }, hasValidTypes: ${ hasValidTypes }, hasValidData: ${ hasValidData }`, "validateUserDeleteData", LogSeverity.DEBUG);
	if(!isDefined || !hasValidTypes || !hasValidData) {
		log("Invalid POST data found.", "validateUserDeleteData", LogSeverity.WARN);
	}

	return isDefined && hasValidTypes && hasValidData;
}
