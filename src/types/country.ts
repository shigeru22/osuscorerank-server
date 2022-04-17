export interface ICountryPOSTData {
	countryName: string;
	countryCode: string;
}

export interface ICountryDELETEData {
	countryId: number;
}

export interface ICountryData {
	countryName: string;
	countryCode: string;
}

export interface ICountryItemData extends ICountryData {
	countryId: number;
}

export interface ICountryResponse {
	country: ICountryItemData;
}

export interface ICountriesResponse {
	countries: ICountryItemData[];
	length: number;
}
