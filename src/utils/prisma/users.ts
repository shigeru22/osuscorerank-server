import { Prisma, PrismaClient } from "@prisma/client";
import { IUserPOSTData } from "../../types/user";
import { IUser } from "../../types/prisma/user";
import { LogLevel, log } from "../log";

const prisma = new PrismaClient();

export async function getUsers(): Promise<IUser[]> {
	try {
		const result = await prisma.users.findMany({
			select: {
				userId: true,
				userName: true,
				osuId: true,
				country: {
					select: {
						countryId: true,
						countryName: true,
						osuId: true
					}
				}
			}
		});

		return result;
	}
	catch (e) {
		if(e instanceof Prisma.PrismaClientKnownRequestError) {
			log(`Prisma Client returned error code ${ e.code }. See documentation for details.`, LogLevel.ERROR);
		}
		else {
			log("Unknown error occurred while querying data.", LogLevel.ERROR);
		}

		return [];
	}
}

export async function getUserById(id: number): Promise<IUser | null> {
	try {
		const result = await prisma.users.findFirst({
			select: {
				userId: true,
				userName: true,
				osuId: true,
				country: {
					select: {
						countryId: true,
						countryName: true,
						osuId: true
					}
				}
			},
			where: {
				userId: id
			}
		});

		return result;
	}
	catch (e) {
		if(e instanceof Prisma.PrismaClientKnownRequestError) {
			log(`Prisma Client returned error code ${ e.code }. See documentation for details.`, LogLevel.ERROR);
		}
		else {
			log("Unknown error occurred while querying data.", LogLevel.ERROR);
		}

		return null;
	}
}

export async function getUserByOsuId(id: number): Promise<IUser | null> {
	try {
		const result = await prisma.users.findFirst({
			select: {
				userId: true,
				userName: true,
				osuId: true,
				country: {
					select: {
						countryId: true,
						countryName: true,
						osuId: true
					}
				}
			},
			where: {
				osuId: id
			}
		});

		return result;
	}
	catch (e) {
		if(e instanceof Prisma.PrismaClientKnownRequestError) {
			log(`Prisma Client returned error code ${ e.code }. See documentation for details.`, LogLevel.ERROR);
		}
		else {
			log("Unknown error occurred while querying data.", LogLevel.ERROR);
		}

		return null;
	}
}

export async function insertUser(users: IUserPOSTData[]) {
	try {
		const data: Prisma.UsersCreateManyInput[] = users.map(item => ({
			userName: item.userName,
			osuId: item.osuId,
			countryId: item.countryId
		}));

		const result = await prisma.users.createMany({
			data: data,
			skipDuplicates: true
		});

		if(result.count > 0) {
			log(`users: Inserted ${ result.count } rows.`, LogLevel.LOG);
		}
		else {
			log("users: Failed to insert rows.", LogLevel.ERROR);
		}

		return result.count;
	}
	catch (e) {
		if(e instanceof Prisma.PrismaClientKnownRequestError) {
			log(`Prisma Client returned error code ${ e.code }. See documentation for details.`, LogLevel.ERROR);
		}
		else {
			log("Unknown error occurred while inserting data.", LogLevel.ERROR);
		}

		return 0;
	}
}

export async function removeUser(id: number) {
	try {
		const user = await prisma.users.findMany({
			where: {
				userId: id
			}
		});

		if(user.length !== 1) {
			log("User not found or returned more than 1 rows.", LogLevel.ERROR);
			return 0;
		}

		const result = await prisma.users.delete({
			where: {
				userId: id
			}
		});

		if(result.userId === id) {
			log("users: Deleted 1 row.", LogLevel.LOG);
			return 1;
		}
		else {
			log("Invalid deleted user record.", LogLevel.ERROR);
			return 0;
		}
	}
	catch (e) {
		if(e instanceof Prisma.PrismaClientKnownRequestError) {
			log(`Prisma Client returned error code ${ e.code }. See documentation for details.`, LogLevel.ERROR);
		}
		else {
			log("Unknown error occurred while deleting data.", LogLevel.ERROR);
		}

		return 0;
	}
}

export async function removeUserByCountryId(id: number) {
	try {
		const users = await prisma.users.findMany({
			where: {
				countryId: id
			}
		});

		if(users.length > 0) {
			const result = await prisma.users.deleteMany({
				where: {
					countryId: id
				}
			});

			if(result.count <= 0) {
				log("Invalid deleted user record.", LogLevel.ERROR);
				return -1;
			}

			log(`users: Deleted ${ result.count } rows.`, LogLevel.LOG);
			return result.count;
		}

		return 0;
	}
	catch (e) {
		if(e instanceof Prisma.PrismaClientKnownRequestError) {
			log(`Prisma Client returned error code ${ e.code }. See documentation for details.`, LogLevel.ERROR);
		}
		else {
			log("Unknown error occurred while inserting data.", LogLevel.ERROR);
		}

		return 0;
	}
}

export async function removeAllUsers() {
	try {
		const users = await prisma.users.findMany();

		if(users.length > 0) {
			const result = await prisma.users.deleteMany();

			if(result.count < 0) {
				log("Invalid deleted user record.", LogLevel.ERROR);
				return -1;
			}

			log(`users: Deleted ${ result.count } rows.`, LogLevel.LOG);
			return result.count;
		}

		return 0;
	}
	catch (e) {
		if(e instanceof Prisma.PrismaClientKnownRequestError) {
			log(`Prisma Client returned error code ${ e.code }. See documentation for details.`, LogLevel.ERROR);
		}
		else {
			log("Unknown error occurred while inserting data.", LogLevel.ERROR);
		}

		return 0;
	}
}
