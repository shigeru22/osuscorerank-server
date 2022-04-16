import { IUserData } from "../user";

export interface IUserDetailData extends IUserData {
	key: string;
	dateAdded: Date | string;
}
