import { Beatmapset, Spotlight, UserStatistics } from "./osu-structures";

export interface ClientCredentialsPOSTRequest {
  client_id: number;
  client_secret: string;
  grant_type: "client_credentials";
  scope: "public";
}

export interface ClientCredentialsPOSTResponse {
  token_type: string;
  expires_in: number;
  access_token: string;
}

export interface RankingsGETResponse<T> {
  beatmapsets: Beatmapset[] | null;
  cursor: T | null;
  ranking: UserStatistics[];
  spotlight: Spotlight | null;
  total: number;
}
