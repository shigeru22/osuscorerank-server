import { Prisma, PrismaClient } from "@prisma/client";
import { ICountryPOSTData } from "../../types/country";
import { Country } from "../../types/prisma/country";
import { LogLevel, log } from "../log";

const prisma = new PrismaClient();

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
			log(`Prisma Client returned error code ${ e.code }. See documentation for details.`, LogLevel.ERROR);
		}
		else {
			log("Unknown error occurred while querying row data.", LogLevel.ERROR);
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
			log(`Prisma Client returned error code ${ e.code }. See documentation for details.`, LogLevel.ERROR);
		}
		else {
			log("Unknown error occurred while querying row data.", LogLevel.ERROR);
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
			log(`countries: Inserted ${ result.count } rows.`, LogLevel.LOG);
		}
		else {
			log("countries: Failed to insert rows.", LogLevel.LOG);
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

export async function removeCountry(id: number) {
	try {
		const country = await prisma.countries.findMany({
			where: {
				countryId: id
			}
		});

		if(country.length !== 1) {
			log("[ERROR] Country not found or returned more than 1 rows.", LogLevel.ERROR);
			return 0;
		}

		const result = await prisma.countries.delete({
			where: {
				countryId: id
			}
		});

		if(result.countryId === id) {
			log("countries: Deleted 1 row.", LogLevel.LOG);
			return 1;
		}
		else {
			log("Invalid deleted country record.", LogLevel.ERROR);
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
		const result = await prisma.countries.deleteMany();

		if(result.count > 0) {
			log(`countries: Deleted ${ result.count } rows.`, LogLevel.LOG);
		}
		else {
			log("Invalid deleted user record.", LogLevel.ERROR);
		}

		return result.count;
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
