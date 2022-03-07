import { IUser } from "./prisma/user";

export interface IUserPOSTData {
  userName: string;
  osuId: number;
  countryId: number;
}

export interface IUserDELETEData {
  userId: number;
}

export interface IUserScoreData {
  userName: string;
  osuId: number;
  countryId: number;
  score: number;
  pp: number;
  globalRank: number;
}

export interface IUserCountryInsertion {
  countryId: number;
  insertion: number;
}

export interface IUsersResponse {
  users: IUser[];
  length: number;
}

export interface IUserResponse {
  user: IUser;
}
