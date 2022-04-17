import { ICountryItemData } from "./country";

export interface IUserPOSTData {
  userName: string;
  osuId: number;
  countryId: number;
}

export interface IUserDELETEData {
  userId: number;
}

export interface IUserData {
	userName: string;
	osuId: number;
	country: ICountryItemData;
}

export interface IUserItemData extends IUserData {
  userId: number;
}

export interface IUserCountryInsertion {
  countryId: number;
  insertion: number;
}

export interface IUserResponse {
  user: IUserItemData;
}

export interface IUsersResponse {
  users: IUserItemData[];
  length: number;
}
