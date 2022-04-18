import { IUserCountryData, IUserData } from "../user";

export interface IUserDetailData extends IUserData {
	key: string;
	countryId: number;
	dateAdded: Date | string;
}

export interface IUserCountryDetailData extends IUserCountryData {
	key: string;
	countryId: number;
	dateAdded: Date | string;
}
