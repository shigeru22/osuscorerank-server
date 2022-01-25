export interface ScoreWithCountry {
	scoreId: number;
	user: {
		userId: number;
		userName: string;
		osuId: number;
		country: {
			countryId: number;
			countryName: string;
			osuId: number;
		};
	};
	score: bigint | number;
	globalRank: number;
}

export interface Score {
	scoreId: number;
	user: {
		userId: number;
		userName: string;
		osuId: number;
	};
	score: bigint | number;
	globalRank: number;
}
