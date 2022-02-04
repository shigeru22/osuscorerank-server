import { IUser } from "./prisma/user";

export interface IUserPOSTData {
  userName: string;
  osuId: number;
  countryId: number;
}

export interface IUserDELETEData {
  userId: number;
}

export interface IUsersResponse {
  users: IUser[];
  length: number;
}

export interface IUserResponse {
  user: IUser;
}
