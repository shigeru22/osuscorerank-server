export interface Users {
	userId: number;
	userName: string;
	osuId: number;
	country: {
		countryId: number;
		countryName: string;
		osuId: number;
	};
}
