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
	recentlyInactive: number;
	highestId: number;
}

export interface ICountryItemData extends ICountryData {
	countryId: number;
}

export interface ICountryItemKeyData {
	key: number;
	item: ICountryData;
}

export interface ICountryItemDetailData extends ICountryData {
	key: string;
	dateAdded: Date | string;
}

export interface ICountryResponse {
	country: ICountryItemData;
}

export interface ICountriesResponse {
	countries: ICountryItemData[];
	length: number;
}
