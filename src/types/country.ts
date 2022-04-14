export interface ICountryPOSTData {
	countryName: string;
	countryCode: string;
}

export interface ICountryItemData {
	countryName: string;
	countryCode: string;
	recentlyInactive: number;
	highestId: number;
}

export interface ICountryItemKeyData {
	key: number;
	item: ICountryItemData;
}

export interface ICountryItemDetailData extends ICountryItemData {
	key: string;
	dateAdded: Date | string;
}

export interface ICountryResponse {
	countries: ICountryItemData;
}

export interface ICountriesResponse {
	countries: ICountryItemData[];
	total: number;
}
