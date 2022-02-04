import { ICountry } from "./prisma/country";

export interface ICountryPOSTData {
	countryName: string;
	osuId: number;
	recentlyInactive: number;
	totalInactive: number;
}

export interface ICountryDELETEData {
	countryId: number;
}

export interface ICountriesResponse {
	countries: ICountry[];
	total: number;
}

export interface ICountryResponse {
	country: ICountry;
}
