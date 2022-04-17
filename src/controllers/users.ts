import { Request, Response, NextFunction } from "express";
import _ from "lodash";
import { IResponseData, IResponseMessage } from "../types/express";
import { IUserDELETEData, IUserPOSTData, IUserResponse, IUsersResponse } from "../types/user";
import { getCountryByKey } from "../utils/deta/countries";
import { getUserByKey, getUserByOsuId, getUsers, insertUser, removeUser } from "../utils/deta/users";
import { HTTPStatus } from "../utils/http";
import { LogSeverity, log } from "../utils/log";
import { checkNumber } from "../utils/common";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getAllUsers(req: Request, res: Response, next: NextFunction) {
	log("Function accessed.", "getAllUsers", LogSeverity.LOG);

	const data = await getUsers(res.locals.deta);
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
				userId: parseInt(item.key, 10),
				userName: item.userName,
				osuId: item.osuId,
				country: item.country
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
		log("Invalid ID parameter. Sending error response.", "getAllUsers", LogSeverity.WARN);

		const ret: IResponseMessage = {
			message: "Invalid ID parameter."
		};

		res.status(HTTPStatus.BAD_REQUEST).json(ret);
		return;
	}

	const data = await getUserByKey(res.locals.deta, id);
	if(_.isNull(data)) {
		const ret: IResponseMessage = {
			message: "User with specified ID can't be found."
		};

		res.status(HTTPStatus.NOT_FOUND).json(ret);
		return;
	}

	log("User data retrieved successfully. Sending data response.", "getUser", LogSeverity.LOG);

	const ret: IResponseData<IUserResponse> = {
		message: "Data retrieved successfully.",
		data: {
			user: {
				userId: parseInt(data.key, 10),
				userName: data.userName,
				osuId: data.osuId,
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
				message: "Country with specified ID can't be found."
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
				message: "User with specified ID can't be found."
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
	/* TODO: implement isDefined to all validations */

	const isDefined = !_.isUndefined(data.userName) && !_.isUndefined(data.osuId) && !_.isUndefined(data.countryId);
	const hasValidTypes = _.isString(data.userName) && _.isNumber(data.osuId) && _.isNumber(data.countryId);
	const hasValidData = isDefined && (!_.isEmpty(data.userName) && checkNumber(data.osuId) && checkNumber(data.countryId));

	log(`isDefined: ${ isDefined }, hasValidTypes: ${ hasValidTypes }, hasValidData: ${ hasValidData }`, "validateUserPostData", LogSeverity.DEBUG);
	if(!isDefined || !hasValidTypes || !hasValidData) {
		log("Invalid POST data found.", "validateUserPostData", LogSeverity.WARN);
	}

	return isDefined && hasValidTypes && hasValidData;
}

function validateUserDeleteData(data: IUserDELETEData) {
	/* TODO: implement isDefined to all validations */

	const isDefined = !_.isUndefined(data.userId);
	const hasValidTypes = _.isNumber(data.userId);
	const hasValidData = isDefined && (checkNumber(data.userId));

	log(`isDefined: ${ isDefined }, hasValidTypes: ${ hasValidTypes }, hasValidData: ${ hasValidData }`, "validateUserDeleteData", LogSeverity.DEBUG);
	if(!isDefined || !hasValidTypes || !hasValidData) {
		log("Invalid POST data found.", "validateUserDeleteData", LogSeverity.WARN);
	}

	return isDefined && hasValidTypes && hasValidData;
}
