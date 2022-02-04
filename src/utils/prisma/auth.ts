import { Prisma, PrismaClient } from "@prisma/client";
import { IClient } from "../../types/prisma/auth";
import { LogLevel, log } from "../log";

const prisma = new PrismaClient();

export async function getClientById(id: string): Promise<IClient | null> {
	try {
		const result = await prisma.auth.findFirst({
			select: {
				clientId: true,
				clientName: true,
				clientKey: true
			},
			where: {
				clientId: id
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
