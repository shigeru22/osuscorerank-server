import { ICountryItemData } from "./country";

export interface IUserPOSTData {
  userName: string;
  osuId: number;
  countryId: number;
}

export interface IUserPUTData {
  userId: number;
  userName: string;
  countryId: number;
}

export interface IUserDELETEData {
  userId: number;
}

export interface IUserData {
	userName: string;
	osuId: number;
}

export interface IUserCountryData extends IUserData {
  country: ICountryItemData;
}

export interface IUserItemData extends IUserData {
  userId: number;
}

export interface IUserCountryItemData extends IUserCountryData {
  userId: number;
}

export interface IUserCountryInsertion {
  countryId: number;
  insertion: number;
}

export interface IUserResponse {
  user: IUserCountryItemData;
}

export interface IUsersResponse {
  users: IUserCountryItemData[];
  length: number;
}

export interface ICountryUsersResponse {
  country: ICountryItemData;
  users: IUserItemData[];
  length: number;
}
