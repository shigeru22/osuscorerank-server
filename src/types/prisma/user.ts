export interface User {
	userId: number;
	userName: string;
	osuId: number;
	country: {
		countryId: number;
		countryName: string;
		osuId: number;
	};
}
