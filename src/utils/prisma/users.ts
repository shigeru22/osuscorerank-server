import { Prisma, PrismaClient } from "@prisma/client";
import { IUserPOSTData } from "../../types/users";
import { Users } from "../../types/prisma/users";

const prisma = new PrismaClient();

export async function getUsers(): Promise<Users[]> {
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
			console.log(`[ERROR] Prisma Client returned error code ${ e.code }. See documentation for details.`);
		}
		else {
			console.log("[ERROR] Unknown error occurred while querying data.");
		}

		return [];
	}
}

export async function getUserById(id: number): Promise<Users | null> {
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
			console.log(`[ERROR] Prisma Client returned error code ${ e.code }. See documentation for details.`);
		}
		else {
			console.log("[ERROR] Unknown error occurred while querying data.");
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
			console.log(`[INFO] users: Inserted ${ result.count } rows.`);
		}
		else {
			console.log("[INFO] users: Failed to insert rows.");
		}

		return result.count;
	}
	catch (e) {
		if(e instanceof Prisma.PrismaClientKnownRequestError) {
			console.log(`[ERROR] Prisma Client returned error code ${ e.code }. See documentation for details.`);
		}
		else {
			console.log("[ERROR] Unknown error occurred while inserting data.");
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
			console.log("[ERROR] User not found or returned more than 1 rows.");
			return 0;
		}

		const result = await prisma.users.delete({
			where: {
				userId: id
			}
		});

		if(result.userId === id) {
			console.log("[INFO] users: Deleted 1 row.");
			return 1;
		}
		else {
			console.log("[ERROR] Invalid deleted user record.");
			return 0;
		}
	}
	catch (e) {
		if(e instanceof Prisma.PrismaClientKnownRequestError) {
			console.log(`[ERROR] Prisma Client returned error code ${ e.code }. See documentation for details.`);
		}
		else {
			console.log("[ERROR] Unknown error occurred while deleting data.");
		}

		return 0;
	}
}
