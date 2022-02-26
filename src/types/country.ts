import { ICountry } from "./prisma/country";

export interface ICountryPOSTData {
	countryName: string;
	countryCode: string;
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
