import { Prisma, PrismaClient } from "@prisma/client";
import { ICountryPOSTData } from "../../types/country";
import { Country } from "../../types/prisma/country";

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
