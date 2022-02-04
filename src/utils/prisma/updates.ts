import { Prisma, PrismaClient } from "@prisma/client";
import { LogLevel, log } from "../log";

const prisma = new PrismaClient();

export async function getLatestUpdate() {
	try {
		const result = await prisma.updates.findFirst({
			select: {
				date: true,
				apiVersion: true,
				webVersion: true
			},
			orderBy: {
				date: "desc"
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

export async function getRecentInactives() {
	try {
		const result = await prisma.updates.findFirst({
			select: {
				date: true,
				recentlyInactive: true,
				totalInactive: true
			},
			orderBy: {
				date: "desc"
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
