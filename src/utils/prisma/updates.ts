import { Prisma, PrismaClient } from "@prisma/client";
import _ from "lodash";
import { IUpdatePOSTData } from "../../types/updates";
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
				recentlyInactive: true
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

export async function insertUpdate(data: IUpdatePOSTData) {
	try {
		const lastUpdate = await prisma.updates.findFirst();
		const users = await prisma.users.findMany({
			orderBy: {
				userId: "desc"
			}
		});

		const update: Prisma.UpdatesCreateInput = {
			date: new Date(),
			apiVersion: data.apiVersion,
			webVersion: data.webVersion,
			recentlyInactive: !_.isNull(lastUpdate) ? users.length - lastUpdate.highestId : users.length !== 0 ? users.length : 0,
			highestId: users.length !== 0 ? users[0].userId : 0
		};

		await prisma.updates.create({
			data: update
		});

		return 1;
	}
	catch (e) {
		if(e instanceof Prisma.PrismaClientKnownRequestError) {
			log(`Prisma Client returned error code ${ e.code }. See documentation for details.`, LogLevel.ERROR);
		}
		else {
			log("Unknown error occurred while querying data.", LogLevel.ERROR);
		}

		return 0;
	}
}
