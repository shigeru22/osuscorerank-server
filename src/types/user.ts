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
	country: {
		countryId: number;
		countryName: string;
		countryCode: string;
	};
}

export interface IUserItemData extends IUserData {
  userId: number;
}

export interface IUserKeyData {
  key: number;
  item: IUserData;
}

export interface IUserDetailData extends IUserData {
	key: string;
	dateAdded: Date | string;
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
