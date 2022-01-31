import { Prisma, PrismaClient } from "@prisma/client";
import { IScorePOSTData } from "../../types/score";
import { ScoreWithCountry, Score } from "../../types/prisma/score";
import { LogLevel, log } from "../log";

const prisma = new PrismaClient();

export async function getScores(): Promise<ScoreWithCountry[]> {
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
			log(`Prisma Client returned error code ${ e.code }. See documentation for details.`, LogLevel.ERROR);
		}
		else {
			log("Unknown error occurred while querying data.", LogLevel.ERROR);
		}

		return [];
	}
}

export async function getScoresByCountryId(id: number): Promise<Score[]> {
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
			log(`Prisma Client returned error code ${ e.code }. See documentation for details.`, LogLevel.ERROR);
		}
		else {
			log("Unknown error occurred while querying data.", LogLevel.ERROR);
		}

		return [];
	}
}

export async function getScoreByUserId(id: number): Promise<ScoreWithCountry | null> {
	try {
		const result = await prisma.scores.findFirst({
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
			log(`Prisma Client returned error code ${ e.code }. See documentation for details.`, LogLevel.ERROR);
		}
		else {
			log("Unknown error occurred while querying data.", LogLevel.ERROR);
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
			log(`users: Inserted ${ result.count } rows.`, LogLevel.LOG);
		}
		else {
			log("users: Failed to insert rows.");
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

export async function removeScore(id: number) {
	try {
		const score = await prisma.scores.findMany({
			where: {
				userId: id
			}
		});

		if(score.length !== 1) {
			log("Score not found or returned more than 1 rows.", LogLevel.ERROR);
			return 0;
		}

		const result = await prisma.scores.delete({
			where: {
				scoreId: score[0].scoreId
			}
		});

		if(result.scoreId === score[0].scoreId) {
			log("scores: Deleted 1 row.", LogLevel.LOG);
			return 1;
		}
		else {
			log("[ERROR] Invalid deleted user record.", LogLevel.ERROR);
			return -1;
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

export async function removeScoresByCountryId(id: number) {
	try {
		const scores = await prisma.scores.findMany({
			where: {
				user: {
					countryId: id
				}
			}
		});

		if(scores.length > 0) {
			const result = await prisma.scores.deleteMany({
				where: {
					user: {
						countryId: id
					}
				}
			});

			if(result.count <= 0) {
				log("Failed to delete scores.", LogLevel.ERROR);
				return -1;
			}

			log(`scores: Deleted ${ result.count } rows.`, LogLevel.LOG);
			return result.count;
		}

		return 0;
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

export async function removeAllScores() {
	try {
		const scores = await prisma.scores.findMany();

		if(scores.length > 0) {
			const result = await prisma.scores.deleteMany();

			if(result.count < 0) {
				log("Invalid deleted score record.", LogLevel.ERROR);
				return -1;
			}

			log(`scores: Deleted ${ result.count } rows.`, LogLevel.LOG);
			return result.count;
		}

		return 0;
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
