import { Prisma, PrismaClient } from "@prisma/client";
import { ICountryPOSTData } from "../../types/countries";
import { IUserPOSTData } from "../../types/users";
import { IScorePOSTData } from "../../types/scores";
import { Country } from "../../types/prisma/country";
import { Users } from "../../types/prisma/users";

const prisma = new PrismaClient();

/* countries */

export async function getCountries(): Promise<Country[]> {
	try {
		const result = await prisma.countries.findMany({
			select: {
				countryId: true,
				countryName: true,
				osuId: true
			},
			orderBy: {
				countryId: "asc"
			}
		});

		return result;
	}
	catch (e) {
		if(e instanceof Prisma.PrismaClientKnownRequestError) {
			console.log(`[ERROR] Prisma Client returned error code ${ e.code }. See documentation for details.`);
		}
		else {
			console.log("[ERROR] Unknown error occurred while querying row data.");
		}

		return [];
	}
}

export async function getCountryById(id: number): Promise<Country | null> {
	try {
		const result = await prisma.countries.findFirst({
			select: {
				countryId: true,
				countryName: true,
				osuId: true
			},
			where: {
				countryId: id
			}
		});

		return result;
	}
	catch (e) {
		if(e instanceof Prisma.PrismaClientKnownRequestError) {
			console.log(`[ERROR] Prisma Client returned error code ${ e.code }. See documentation for details.`);
		}
		else {
			console.log("[ERROR] Unknown error occurred while querying row data.");
		}

		return null;
	}
}

export async function insertCountry(countries: ICountryPOSTData[]) {
	try {
		const data: Prisma.CountriesCreateManyInput[] = countries.map(item => ({
			countryName: item.countryName,
			osuId: item.osuId
		}));

		const result = await prisma.countries.createMany({
			data: data,
			skipDuplicates: true
		});

		if(result.count > 0) {
			console.log(`[INFO] countries: Inserted ${ result.count } rows.`);
		}
		else {
			console.log("[INFO] countries: Failed to insert rows.");
		}

		return result.count;
	}
	catch (e) {
		if(e instanceof Prisma.PrismaClientKnownRequestError) {
			console.log(`[ERROR] Prisma Client returned error code ${ e.code }. See documentation for details.`);
		}
		else {
			console.log("[ERROR] Unknown error occurred while inserting row data.");
		}

		return 0;
	}
}

export async function removeCountry(id: number) {
	try {
		const country = await prisma.countries.findMany({
			where: {
				countryId: id
			}
		});

		if(country.length !== 1) {
			console.log("[ERROR] Country not found or returned more than 1 rows.");
			return 0;
		}

		const result = await prisma.countries.delete({
			where: {
				countryId: id
			}
		});

		if(result.countryId === id) {
			console.log("[INFO] countries: Deleted 1 row.");
			return 1;
		}
		else {
			console.log("[ERROR] Invalid deleted country record.");
			return 0;
		}
	}
	catch (e) {
		if(e instanceof Prisma.PrismaClientKnownRequestError) {
			console.log(`[ERROR] Prisma Client returned error code ${ e.code }. See documentation for details.`);
		}
		else {
			console.log("[ERROR] Unknown error occurred while deleting row data.");
		}

		return 0;
	}
}

/* users */

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

/* scores */

export async function getScores() {
	try {
		const result = await prisma.scores.findMany({
			select: {
				scoreId: true,
				user: {
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
				},
				score: true,
				globalRank: true
			},
			orderBy: {
				score: "desc"
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

export async function getScoresByCountryId(id: number) {
	try {
		const result = await prisma.scores.findMany({
			select: {
				scoreId: true,
				user: {
					select: {
						userId: true,
						userName: true,
						osuId: true
					}
				},
				score: true,
				globalRank: true
			},
			where: {
				user: {
					countryId: id
				}
			},
			orderBy: {
				score: "desc"
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

export async function getScoreByUserId(id: number) {
	try {
		const result = await prisma.scores.findFirst({
			select: {
				scoreId: true,
				user: {
					select: {
						userId: true,
						userName: true,
						osuId: true
					}
				},
				score: true,
				globalRank: true
			},
			where: {
				user: {
					userId: id
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

		return null;
	}
}

export async function insertScore(scores: IScorePOSTData[]) {
	try {
		const data: Prisma.ScoresCreateManyInput[] = scores.map(item => ({
			userId: item.userId,
			score: item.score,
			globalRank: item.globalRank
		}));

		const result = await prisma.scores.createMany({
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

export async function removeScore(id: number) {
	try {
		const score = await prisma.scores.findMany({
			where: {
				userId: id
			}
		});

		if(score.length !== 1) {
			console.log("[ERROR] Score not found or returned more than 1 rows.");
			return 0;
		}

		const result = await prisma.scores.delete({
			where: {
				scoreId: score[0].scoreId
			}
		});

		if(result.scoreId === score[0].scoreId) {
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

export async function removeAllScores() {
	try {
		const result = await prisma.scores.deleteMany();

		if(result.count > 0) {
			console.log(`[INFO] users: Deleted ${ result.count } row.`);
		}
		else {
			console.log("[ERROR] Invalid deleted user record.");
		}

		return result.count;
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
