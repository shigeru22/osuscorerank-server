import { Prisma, PrismaClient } from "@prisma/client";
import _ from "lodash";
import { IGlobalScore, ICountryScore, IUserScore, IScoreInsertData, IScoreUpdateData } from "../../types/prisma/score";
import { LogLevel, log } from "../log";

const prisma = new PrismaClient();

export async function getScores(sort: number): Promise<IGlobalScore[]> {
	try {
		const scoreSorting: Prisma.Enumerable<Prisma.ScoresOrderByWithRelationInput> = {
			score: "desc"
		};

		const ppSorting: Prisma.Enumerable<Prisma.ScoresOrderByWithRelationInput> = {
			pp: "desc"
		};

		let sorting = 1;
		if(!_.isUndefined(sort)) {
			sorting = sort;
		}

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
								countryCode: true
							}
						}
					}
				},
				score: true,
				pp: true,
				globalRank: true,
				previousGlobalPpRank: true,
				previousGlobalScoreRank: true
			},
			orderBy: sorting === 1 ? scoreSorting : ppSorting
		});

		return result;
	}
	catch (e) {
		if(e instanceof Prisma.PrismaClientKnownRequestError) {
			log(`scores :: Prisma Client returned error code ${ e.code }. See documentation for details.`, LogLevel.ERROR);
		}
		else {
			log("scores :: Unknown error occurred while querying data.", LogLevel.ERROR);
		}

		return [];
	}
}

export async function getScoresByCountryId(id: number, sort = 1): Promise<ICountryScore[]> {
	try {
		const scoreSorting: Prisma.Enumerable<Prisma.ScoresOrderByWithRelationInput> = {
			score: "desc"
		};

		const ppSorting: Prisma.Enumerable<Prisma.ScoresOrderByWithRelationInput> = {
			pp: "desc"
		};

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
				pp: true,
				globalRank: true,
				previousPpRank: true,
				previousScoreRank: true
			},
			where: {
				user: {
					countryId: id
				}
			},
			orderBy: sort === 1 ? scoreSorting : ppSorting
		});

		return result;
	}
	catch (e) {
		if(e instanceof Prisma.PrismaClientKnownRequestError) {
			log(`scores :: Prisma Client returned error code ${ e.code }. See documentation for details.`, LogLevel.ERROR);
		}
		else {
			log("scores :: Unknown error occurred while querying data.", LogLevel.ERROR);
		}

		return [];
	}
}

export async function getScoreByUserId(id: number): Promise<IUserScore | null> {
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
								countryCode: true
							}
						}
					}
				},
				score: true,
				pp: true,
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
			log(`scores :: Prisma Client returned error code ${ e.code }. See documentation for details.`, LogLevel.ERROR);
		}
		else {
			log("scores :: Unknown error occurred while querying data.", LogLevel.ERROR);
		}

		return null;
	}
}

export async function getScoresByUserIds(id: number[], sort = 1): Promise<IUserScore[]> {
	try {
		const scoreSorting: Prisma.Enumerable<Prisma.ScoresOrderByWithRelationInput> = {
			score: "desc"
		};

		const ppSorting: Prisma.Enumerable<Prisma.ScoresOrderByWithRelationInput> = {
			pp: "desc"
		};

		const resAllData = await prisma.scores.findMany({
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
								countryCode: true
							}
						}
					}
				},
				score: true,
				pp: true,
				globalRank: true
			},
			orderBy: sort === 1 ? scoreSorting : ppSorting
		});

		/* TODO: simplify using getScores() in controllers */
		return resAllData.filter(row => _.includes(id, row.user.userId));
	}
	catch (e) {
		if(e instanceof Prisma.PrismaClientKnownRequestError) {
			log(`scores :: Prisma Client returned error code ${ e.code }. See documentation for details.`, LogLevel.ERROR);
		}
		else {
			log("scores :: Unknown error occurred while querying data.", LogLevel.ERROR);
		}

		return [];
	}
}

export async function insertScore(scores: IScoreInsertData[], silent = false) {
	try {
		const data: Prisma.ScoresCreateManyInput[] = scores.map(item => ({
			userId: item.userId,
			score: item.score,
			pp: item.pp, // FIXME: check for floating numbers
			globalRank: item.globalRank,
			previousPpRank: item.previousPpRank,
			previousScoreRank: item.previousScoreRank,
			previousGlobalPpRank: item.previousGlobalPpRank,
			previousGlobalScoreRank: item.previousGlobalScoreRank
		}));

		const result = await prisma.scores.createMany({
			data: data,
			skipDuplicates: true
		});

		if(!silent) {
			if(result.count > 0) {
				log(`scores: Inserted ${ result.count } rows.`, LogLevel.LOG);
			}
			else {
				log("scores: Failed to insert rows.");
			}
		}

		return result.count;
	}
	catch (e) {
		if(e instanceof Prisma.PrismaClientKnownRequestError) {
			log(`scores :: Prisma Client returned error code ${ e.code }. See documentation for details.`, LogLevel.ERROR);
		}
		else {
			log("scores :: Unknown error occurred while inserting data.", LogLevel.ERROR);
		}

		return 0;
	}
}

export async function updateScore(score: IScoreUpdateData, silent = false) {
	try {
		const data: Prisma.ScoresUpdateInput = {
			score: score.score,
			pp: score.pp,
			globalRank: score.globalRank,
			previousPpRank: score.previousPpRank,
			previousScoreRank: score.previousScoreRank,
			previousGlobalPpRank: score.previousGlobalPpRank,
			previousGlobalScoreRank: score.previousGlobalScoreRank
		};

		const result = await prisma.scores.updateMany({
			data: data,
			where: {
				userId: score.userId
			}
		});

		if(!silent) {
			if(result.count > 0) {
				log("scores: Updated 1 row.", LogLevel.LOG);
			}
			else {
				log("scores: Failed to update row.", LogLevel.ERROR);
			}
		}

		return result.count;
	}
	catch (e) {
		if(e instanceof Prisma.PrismaClientKnownRequestError) {
			log(`scores :: Prisma Client returned error code ${ e.code }. See documentation for details.`, LogLevel.ERROR);
		}
		else {
			log("scores :: Unknown error occurred while updating data.", LogLevel.ERROR);
		}

		return 0;
	}
}

export async function removeScore(id: number, silent = false) {
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
			if(!silent) {
				log("scores: Deleted 1 row.", LogLevel.LOG);
			}

			return 1;
		}
		else {
			if(!silent) {
				log("Invalid deleted user record.", LogLevel.ERROR);
			}

			return -1;
		}
	}
	catch (e) {
		if(e instanceof Prisma.PrismaClientKnownRequestError) {
			log(`scores :: Prisma Client returned error code ${ e.code }. See documentation for details.`, LogLevel.ERROR);
		}
		else {
			log("scores :: Unknown error occurred while deleting data.", LogLevel.ERROR);
		}

		return 0;
	}
}

export async function removeScoresByCountryId(id: number, silent = false) {
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
				if(!silent) {
					log("Failed to delete scores.", LogLevel.ERROR);
				}

				return -1;
			}

			if(!silent) {
				log(`scores: Deleted ${ result.count } rows.`, LogLevel.LOG);
			}

			return result.count;
		}

		return 0;
	}
	catch (e) {
		if(e instanceof Prisma.PrismaClientKnownRequestError) {
			log(`scores :: Prisma Client returned error code ${ e.code }. See documentation for details.`, LogLevel.ERROR);
		}
		else {
			log("scores :: Unknown error occurred while deleting data.", LogLevel.ERROR);
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
			log(`scores :: Prisma Client returned error code ${ e.code }. See documentation for details.`, LogLevel.ERROR);
		}
		else {
			log("scores :: Unknown error occurred while deleting data.", LogLevel.ERROR);
		}

		return 0;
	}
}
