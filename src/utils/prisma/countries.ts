import { Prisma, PrismaClient } from "@prisma/client";
import { ICountryPOSTData } from "../../types/country";
import { IUserCountryInsertion } from "../../types/user";
import { ICountry } from "../../types/prisma/country";
import { LogLevel, log } from "../log";

const prisma = new PrismaClient();

export async function getCountries(): Promise<ICountry[]> {
	try {
		const result = await prisma.countries.findMany({
			select: {
				countryId: true,
				countryName: true,
				countryCode: true,
				recentlyInactive: true
			},
			orderBy: {
				countryId: "asc"
			}
		});

		return result;
	}
	catch (e) {
		if(e instanceof Prisma.PrismaClientKnownRequestError) {
			log(`Prisma Client returned error code ${ e.code }. See documentation for details.`, LogLevel.ERROR);
		}
		else {
			log("Unknown error occurred while querying row data.", LogLevel.ERROR);
		}

		return [];
	}
}

export async function getCountryById(id: number): Promise<ICountry | null> {
	try {
		const result = await prisma.countries.findFirst({
			select: {
				countryId: true,
				countryName: true,
				countryCode: true,
				recentlyInactive: true
			},
			where: {
				countryId: id
			}
		});

		return result;
	}
	catch (e) {
		if(e instanceof Prisma.PrismaClientKnownRequestError) {
			log(`Prisma Client returned error code ${ e.code }. See documentation for details.`, LogLevel.ERROR);
		}
		else {
			log("Unknown error occurred while querying row data.", LogLevel.ERROR);
		}

		return null;
	}
}

export async function getCountryByCode(countryCode: string): Promise<ICountry | null> {
	try {
		const result = await prisma.countries.findFirst({
			select: {
				countryId: true,
				countryName: true,
				countryCode: true,
				recentlyInactive: true
			},
			where: {
				countryCode: countryCode.toUpperCase()
			}
		});

		return result;
	}
	catch (e) {
		if(e instanceof Prisma.PrismaClientKnownRequestError) {
			log(`Prisma Client returned error code ${ e.code }. See documentation for details.`, LogLevel.ERROR);
		}
		else {
			log("Unknown error occurred while querying row data.", LogLevel.ERROR);
		}

		return null;
	}
}

export async function insertCountry(countries: ICountryPOSTData[], silent = false) {
	try {
		const data: Prisma.CountriesCreateManyInput[] = countries.map(item => ({
			countryName: item.countryName,
			countryCode: item.countryCode,
			recentlyInactive: 0,
			highestId: 0
		}));

		const result = await prisma.countries.createMany({
			data: data,
			skipDuplicates: true
		});

		if(!silent) {
			if(result.count > 0) {
				log(`countries: Inserted ${ result.count } rows.`, LogLevel.LOG);
			}
			else {
				log("countries: Failed to insert rows.", LogLevel.LOG);
			}
		}

		return result.count;
	}
	catch (e) {
		if(e instanceof Prisma.PrismaClientKnownRequestError) {
			log(`Prisma Client returned error code ${ e.code }. See documentation for details.`, LogLevel.ERROR);
		}
		else {
			log("Unknown error occurred while inserting row data.", LogLevel.ERROR);
		}

		return 0;
	}
}

export async function increaseInactiveCount(insertionData: IUserCountryInsertion[], silent = false) {
	try {
		let result = 0;

		const len = insertionData.length;
		for(let i = 0; i < len; i++) {
			// eslint-disable-next-line no-await-in-loop
			await prisma.countries.update({
				data: {
					recentlyInactive: {
						increment: insertionData[i].insertion
					}
				},
				where: {
					countryId: insertionData[i].countryId
				}
			});

			result++;
		}

		if(result > 0) {
			if(!silent) {
				log(`countries: Updated ${ result } row.`, LogLevel.LOG);
			}

			return result;
		}
		else {
			if(!silent) {
				log("countries: Failed to update row.", LogLevel.ERROR);
			}

			return 0;
		}
	}
	catch (e) {
		if(e instanceof Prisma.PrismaClientKnownRequestError) {
			log(`Prisma Client returned error code ${ e.code }. See documentation for details.`, LogLevel.ERROR);
		}
		else {
			log("Unknown error occurred while inserting row data.", LogLevel.ERROR);
		}

		return 0;
	}
}

export async function removeCountry(id: number, silent = false) {
	try {
		const country = await prisma.countries.findMany({
			where: {
				countryId: id
			}
		});

		if(country.length !== 1) {
			log("Country not found or returned more than 1 rows.", LogLevel.ERROR);
			return 0;
		}

		const result = await prisma.countries.delete({
			where: {
				countryId: id
			}
		});

		if(result.countryId === id) {
			if(!silent) {
				log("countries: Deleted 1 row.", LogLevel.LOG);
			}

			return 1;
		}
		else {
			if(!silent) {
				log("Invalid deleted country record.", LogLevel.ERROR);
			}

			return 0;
		}
	}
	catch (e) {
		if(e instanceof Prisma.PrismaClientKnownRequestError) {
			log(`Prisma Client returned error code ${ e.code }. See documentation for details.`, LogLevel.ERROR);
		}
		else {
			log("Unknown error occurred while deleting row data.", LogLevel.ERROR);
		}

		return 0;
	}
}

export async function removeAllCountries() {
	try {
		const countries = await prisma.countries.findMany();

		if(countries.length > 0) {
			const result = await prisma.countries.deleteMany();

			if(result.count < 0) {
				log("Invalid deleted country record.", LogLevel.ERROR);
				return -1;
			}

			log(`countries: Deleted ${ result.count } rows.`, LogLevel.LOG);
			return result.count;
		}

		return 0;
	}
	catch (e) {
		if(e instanceof Prisma.PrismaClientKnownRequestError) {
			log(`Prisma Client returned error code ${ e.code }. See documentation for details.`, LogLevel.ERROR);
		}
		else {
			log("Unknown error occurred while deleting row data.", LogLevel.ERROR);
		}

		return 0;
	}
}
