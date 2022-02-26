export interface IUser {
	userId: number;
	userName: string;
	osuId: number;
	country: {
		countryId: number;
		countryName: string;
		countryCode: string;
	};
}
