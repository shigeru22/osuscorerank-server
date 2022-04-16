import { Request, Response, NextFunction } from "express";
import Deta from "deta/dist/types/deta";
import _ from "lodash";
import { IResponseData, IResponseMessage } from "../types/express";
import { IUserDELETEData, IUserPOSTData, IUserResponse, IUsersResponse } from "../types/user";
import { getUserByKey, getUserByOsuId, getUsers, insertUser, removeUser } from "../utils/deta/users";
import { HTTPStatus } from "../utils/http";
import { LogLevel, log } from "../utils/log";
import { checkNumber } from "../utils/common";
import { getCountryByKey } from "../utils/deta/countries";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getAllUsers(deta: Deta, req: Request, res: Response, next: NextFunction) {
	log("Accessed: getAllUsers", LogLevel.LOG);

	const data = await getUsers(deta);
	if(data.length <= 0) {
		const ret: IResponseMessage = {
			message: "No data found."
		};

		res.status(HTTPStatus.NOT_FOUND).json(ret);
	}

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
export async function getUser(deta: Deta, req: Request, res: Response, next: NextFunction) {
	log("Accessed: getUser", LogLevel.LOG);

	const id = _.parseInt(req.params.userId, 10); // database's country id
	if(!checkNumber(id) || id <= 0) {
		const ret: IResponseMessage = {
			message: "Invalid ID parameter."
		};

		res.status(HTTPStatus.BAD_REQUEST).json(ret);
		return;
	}

	const data = await getUserByKey(deta, id);
	if(_.isNull(data)) {
		const ret: IResponseMessage = {
			message: "User with specified ID can't be found."
		};

		res.status(HTTPStatus.NOT_FOUND).json(ret);
		return;
	}

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
export async function addUser(deta: Deta, req: Request, res: Response, next: NextFunction) {
	log("Accessed: addUser", LogLevel.LOG);
	const data: IUserPOSTData = req.body;

	if(!validateUserPostData(data)) {
		const ret: IResponseMessage = {
			message: "Invalid POST data."
		};

		res.status(HTTPStatus.BAD_REQUEST).json(ret);
		return;
	}

	{
		const user = await getUserByOsuId(deta, data.osuId);
		if(!_.isNull(user)) {
			const ret: IResponseMessage = {
				message: "The specified osu! ID has been exist by another user."
			};

			res.status(HTTPStatus.CONFLICT).json(ret);
			return;
		}
	}

	{
		const country = await getCountryByKey(deta, data.countryId);
		if(_.isNull(country)) {
			const ret: IResponseMessage = {
				message: "Country with specified ID can't be found."
			};

			res.status(HTTPStatus.NOT_FOUND).json(ret);
			return;
		}
	}

	const result = await insertUser(deta, data);

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
export async function deleteUser(deta: Deta, req: Request, res: Response, next: NextFunction) {
	log("Accessed: addCountry", LogLevel.LOG);
	const data: IUserDELETEData = req.body;

	if(!validateUserDeleteData(data)) {
		const ret: IResponseMessage = {
			message: "Invalid DELETE data."
		};

		res.status(HTTPStatus.BAD_REQUEST).json(ret);
		return;
	}

	{
		const user = await getUserByKey(deta, data.userId);
		if(_.isNull(user)) {
			const ret: IResponseMessage = {
				message: "User with specified ID can't be found."
			};

			res.status(HTTPStatus.NOT_FOUND).json(ret);
			return;
		}
	}

	/* TODO: remove scores by user id */

	const result = await removeUser(deta, data.userId);
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

function validateUserPostData(data: IUserPOSTData) {
	/* TODO: implement isDefined to all validations */

	const isDefined = !_.isUndefined(data.userName) && !_.isUndefined(data.osuId) && !_.isUndefined(data.countryId);
	const hasValidTypes = _.isString(data.userName) && _.isNumber(data.osuId) && _.isNumber(data.countryId);
	const hasValidData = isDefined && (!_.isEmpty(data.userName) && checkNumber(data.osuId) && checkNumber(data.countryId));

	log(`validateUserPostData :: isDefined: ${ isDefined }, hasValidTypes: ${ hasValidTypes }, hasValidData: ${ hasValidData }`, LogLevel.DEBUG);

	return isDefined && hasValidTypes && hasValidData;
}

function validateUserDeleteData(data: IUserDELETEData) {
	/* TODO: implement isDefined to all validations */

	const isDefined = !_.isUndefined(data.userId);
	const hasValidTypes = _.isNumber(data.userId);
	const hasValidData = isDefined && (checkNumber(data.userId));

	log(`validateUserDeleteData :: isDefined: ${ isDefined }, hasValidTypes: ${ hasValidTypes }, hasValidData: ${ hasValidData }`, LogLevel.DEBUG);

	return isDefined && hasValidTypes && hasValidData;
}
