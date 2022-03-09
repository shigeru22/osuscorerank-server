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
			log(`updates :: Prisma Client returned error code ${ e.code }. See documentation for details.`, LogLevel.ERROR);
		}
		else {
			log("updates :: Unknown error occurred while querying data.", LogLevel.ERROR);
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
			log(`updates :: Prisma Client returned error code ${ e.code }. See documentation for details.`, LogLevel.ERROR);
		}
		else {
			log("updates :: Unknown error occurred while querying data.", LogLevel.ERROR);
		}

		return null;
	}
}

export async function insertUpdate(data: IUpdatePOSTData, silent = false) {
	try {
		const lastUpdate = await prisma.updates.findFirst();
		const user = await prisma.users.findFirst({
			orderBy: {
				userId: "desc"
			}
		});

		const highestId = !_.isNull(user) ? user.userId : 0;

		const update: Prisma.UpdatesCreateInput = {
			date: new Date(),
			apiVersion: data.apiVersion,
			webVersion: data.webVersion,
			recentlyInactive: !_.isNull(lastUpdate) ? highestId - lastUpdate.highestId : highestId,
			highestId
		};

		const result = await prisma.updates.create({
			data: update
		});

		if(result.apiVersion === data.apiVersion) {
			if(!silent) {
				log("updates: Added 1 row.", LogLevel.LOG);
			}

			return 1;
		}
		else {
			if(!silent) {
				log("Invalid record created.", LogLevel.ERROR);
			}

			return 0;
		}
	}
	catch (e) {
		if(e instanceof Prisma.PrismaClientKnownRequestError) {
			log(`updates :: Prisma Client returned error code ${ e.code }. See documentation for details.`, LogLevel.ERROR);
		}
		else {
			log("updates :: Unknown error occurred while querying data.", LogLevel.ERROR);
		}

		return 0;
	}
}
