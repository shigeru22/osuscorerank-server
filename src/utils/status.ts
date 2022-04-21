/* client */

export const enum ClientGetStatus {
  INTERNAL_ERROR = 1,
  NO_DATA,
  DATA_TOO_MANY
}

export const enum ClientInsertStatus {
  OK,
  INTERNAL_ERROR
}

/* countries */

export const enum CountryGetStatus {
  INTERNAL_ERROR = 1,
  NO_DATA,
  DATA_TOO_MANY
}

export const enum CountryInsertStatus {
  OK,
  INTERNAL_ERROR
}

export const enum CountryDeleteStatus {
  OK,
  INTERNAL_ERROR
}

/* users */

export const enum UserGetStatus {
  INTERNAL_ERROR = 1,
  NO_DATA,
  DATA_TOO_MANY
}

export const enum UserInsertStatus {
  OK,
  INTERNAL_ERROR
}

export const enum UserUpdateStatus {
  OK,
  INTERNAL_ERROR
}

export const enum UserDeleteStatus {
  OK,
  INTERNAL_ERROR
}

/* scores */

export const enum ScoreGetStatus {
  INTERNAL_ERROR = 1,
  NO_DATA,
  NO_ONLINE_UPDATE_DATA,
  INVALID_UPDATE_ID,
  DATA_TOO_MANY
}

export const enum ScoreInsertStatus {
  OK,
  INTERNAL_ERROR,
  NO_UPDATE_DATA,
  UPDATE_DATA_FINALIZED,
  NO_OFFLINE_UPDATE_DATA
}

export const enum ScoreUpdateStatus {
  OK,
  INTERNAL_ERROR,
  NO_SCORE,
  NO_USER,
  NO_COUNTRY
}

export const enum ScoreDeleteStatus {
  OK,
  INTERNAL_ERROR
}

/* updates */

export const enum UpdateGetStatus {
  INTERNAL_ERROR = 1,
  NO_DATA
}

export const enum UpdateInsertStatus {
  OK,
  INTERNAL_ERROR
}

export const enum UpdateUpdateStatus {
  OK,
  INTERNAL_ERROR
}
