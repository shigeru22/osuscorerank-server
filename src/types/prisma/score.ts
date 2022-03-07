export interface IScore {
	scoreId: number;
	user: {
		userId: number;
		userName: string;
		osuId: number;
	};
	score: bigint | number;
	pp: number;
	globalRank: number;
}

export interface IGlobalScore extends IScore {
	user: {
		userId: number;
		userName: string;
		osuId: number;
		country: {
			countryId: number;
			countryName: string;
			countryCode: string;
		};
	};
	previousGlobalPpRank: number | null;
	previousGlobalScoreRank: number | null;
}

export interface ICountryScore extends IScore {
	previousPpRank: number | null;
	previousScoreRank: number | null;
}

export interface IUserScore extends IScore {
	user: {
		userId: number;
		userName: string;
		osuId: number;
		country: {
			countryId: number;
			countryName: string;
			countryCode: string;
		};
	};
}

export interface IScoreInsertData {
	userId: number;
	score: number;
	pp: number;
	globalRank: number;
	previousPpRank: number | null;
	previousScoreRank: number | null;
	previousGlobalPpRank: number | null;
	previousGlobalScoreRank: number | null;
}

export interface IScoreUpdateData {
	userId: number;
	score: number;
	pp: number;
	globalRank: number;
	previousPpRank: number;
	previousScoreRank: number;
	previousGlobalPpRank: number;
	previousGlobalScoreRank: number;
}
