import { Request, Response } from "express";
import _ from "lodash";
import { IUserPOSTData, IUserDELETEData } from "../types/user";
import { getUsers, getUserById, insertUser, removeUser, getUserByOsuId } from "../utils/prisma/users";
import { checkNumber } from "../utils/common";
import { HTTPStatus } from "../utils/http";

/* TODO: use JWT for actions other than GET */

export async function getAllUsers(req: Request, res: Response) {
	console.log("[LOG] Accessed: getAllUsers");

	const data = await getUsers();

	const ret = {
		message: "Data retrieved successfully.",
		data: {
			users: data,
			length: data.length
		}
	};

	res.status(HTTPStatus.OK).json(ret);
}

export async function getUser(req: Request, res: Response) {
	console.log("[LOG] Accessed: getUser");

	const id = _.parseInt(req.params.userId, 10); // database's user id

	if(!checkNumber) {
		const ret = {
			message: "Invalid ID parameter."
		};

		res.status(HTTPStatus.BAD_REQUEST).json(ret);
		return;
	}

	const data = await getUserById(id);

	if(_.isNull(data)) {
		const ret = {
			message: "User with specified ID can't be found."
		};

		res.status(HTTPStatus.NOT_FOUND).json(ret);
		return;
	}

	const ret = {
		message: "Data retrieved successfully.",
		data: {
			user: data
		}
	};

	res.status(HTTPStatus.OK).json(ret);
}

export async function addUser(req: Request, res: Response) {
	console.log("[LOG] Accessed: addCountry");

	const data: IUserPOSTData = req.body;

	if(!validateUserPostData(data)) {
		const ret = {
			message: "Invalid POST data."
		};

		res.status(HTTPStatus.BAD_REQUEST).json(ret);
		return;
	}

	const user = await getUserByOsuId(data.osuId);

	if(_.isNull(user)) {
		const ret = {
			message: "User with the specified osu! ID already exists."
		};

		res.status(HTTPStatus.CONFLICT).json(ret);
		return;
	}

	const result = await insertUser([ data ]);

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

export async function deleteUser(req: Request, res: Response) {
	console.log("[LOG] Accessed: deleteUser");

	const data: IUserDELETEData = req.body;

	if(!validateUserDeleteData(data)) {
		const ret = {
			message: "Invalid DELETE data."
		};

		res.status(HTTPStatus.BAD_REQUEST).json(ret);
		return;
	}

	const result = await removeUser(data.userId);

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

function validateUserPostData(data: IUserPOSTData) {
	const hasValidTypes = _.isString(data.userName) && checkNumber(data.osuId) && checkNumber(data.countryId);
	const hasValidData = !_.isEmpty(data.userName) && data.osuId > 0 && data.countryId > 0;

	console.log(`[DEBUG] validateScorePostData :: hasValidTypes: ${ hasValidTypes }, hasValidData: ${ hasValidData }`);

	return hasValidTypes && hasValidData;
}

function validateUserDeleteData(data: IUserDELETEData) {
	const hasValidTypes = checkNumber(data.userId);
	const hasValidData = data.userId > 0;

	console.log(`[DEBUG] validateScorePostData :: hasValidTypes: ${ hasValidTypes }, hasValidData: ${ hasValidData }`);

	return hasValidTypes && hasValidData;
}
