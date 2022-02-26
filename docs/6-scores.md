# Scores

This route contains inactive users score listing (and ranking).

## Get all scores (global)

Retrieves all score in the database. Essentially everything, or global score in general. The queried results are either sorted by score or by Performance Points (pp), creating a ranking list.

Since this is a global ranking list, also returns number of inactive users. Delta calculation is also provided from previously refreshed ranking state.

#### GET `/scores`

##### Query Parameters

`sort` **string** *(optional, defaults to score)*

Sorting criteria. The available options are:

```
1 = score
2 = pp
```

##### Response format (JSON):

```
{
  "message": string,
  "data": {
    "rankings": {
      "scoreId": number,
      "user": {
        "userId": number,
        "userName": string,
        "osuId": number,
        "country": {
          "countryId": number,
          "countryName": string,
          "countryCode": string
        }
      },
      "score": string, // bigint, returned as string
      "pp": number,
      "globalRank": number,
      "delta": number
    }[],
    "inactives": {
      "recentlyInactive": number
    },
    "total": number
  }
}
```

##### Example response (200):

```json
{
  "message": "Data retrieved successfully.",
  "data": {
    "rankings": [
      {
        "scoreId": 4,
        "user": {
          "userId": 4,
          "userName": "EEEEEEEEEEEEEEE",
          "osuId": 2927048,
          "country": {
            "countryId": 4,
            "countryName": "United States",
            "countryCode": "US"
          }
        },
        "score": "970375021269",
        "pp": 9486,
        "globalRank": 2264,
        "delta": 0
      },
      {
        "scoreId": 6,
        "user": {
          "userId": 6,
          "userName": "Venta",
          "osuId": 11320627,
          "country": {
            "countryId": 1,
            "countryName": "Indonesia",
            "countryCode": "ID"
          }
        },
        "score": "350279198497",
        "pp": 10161,
        "globalRank": 1452,
        "delta": 0
      },
      {
        "scoreId": 2,
        "user": {
          "userId": 2,
          "userName": "Patience",
          "osuId": 13509913,
          "country": {
            "countryId": 2,
            "countryName": "Singapore",
            "countryCode": "SG"
          }
        },
        "score": "233011877962",
        "pp": 5074,
        "globalRank": 45789,
        "delta": -1
      },
      // ...
    ],
    "inactives": {
      "recentlyInactive": 6
    },
    "total": 6
  }
}
```

## Get score ranking (country)

Retrieves all score in the database by country specified in route parameter. The queried results are either sorted by score or by Performance Points (pp), creating a ranking list.

Also returns number of inactive users. Delta calculation is also provided from previously refreshed ranking state.

#### GET `/scores/country/{id}`

##### Route Parameters

`id` **string**

Country ID in the database.

##### Query Parameters

`sort` **string** *(optional, defaults to score)*

Sorting criteria. The available options are:

```
1 = score
2 = pp
```

##### Response format:

```
"message": string,
  "data": {
    "country": {
      "countryId": number,
      "countryName": string,
      "countryCode": string
    },
    "rankings": {
      "scoreId": number,
      "user": {
        "userId": number,
        "userName": string,
        "osuId": number
      },
      "score": string, // bigint, returned as string
      "pp": number,
      "globalRank": number,
      "delta": number
    },
    "inactives": {
      "recentlyInactive": number
    },
    "total": number
  }
```

##### Example response (200):

`/scores/country/1`

```json
{
  "message": "Data retrieved successfully.",
  "data": {
    "country": {
      "countryId": 1,
      "countryName": "Indonesia",
      "countryCode": "ID"
    },
    "rankings": [
      {
        "scoreId": 6,
        "user": {
          "userId": 6,
          "userName": "Venta",
          "osuId": 11320627
        },
        "score": "350279198497",
        "pp": 10161,
        "globalRank": 1452,
        "delta": 0
      },
      {
        "scoreId": 1,
        "user": {
          "userId": 1,
          "userName": "Shigeru22",
          "osuId": 2581664
        },
        "score": "206202433453",
        "pp": 8641,
        "globalRank": 3884,
        "delta": -1
      },
      {
        "scoreId": 5,
        "user": {
          "userId": 5,
          "userName": "Itsakaseru",
          "osuId": 6932675
        },
        "score": "89616403675",
        "pp": 9207,
        "globalRank": 2726,
        "delta": 0
      }
    ],
    "inactives": {
      "recentlyInactive": 3
    },
    "total": 3
  }
}
```

##### Example response (400):

`/scores/country/a`

```json
{
  "message": "Invalid ID parameter."
}
```

##### Example response (404):

`/scores/country/100` (ID not in database)

```json
{
  "message": "User with specified ID can't be found."
}
```

## Get user score

Retrieves user score by ID specified in route parameter.

#### GET `/scores/user/{id}`

##### Route Parameters

`id` **string**

User ID in the database.

##### Response format:

```
{
  "message": string,
  "data": {
    "score": {
      "scoreId": number,
      "user": {
        "userId": number,
        "userName": string,
        "osuId": number,
        "country": {
          "countryId": number,
          "countryName": string,
          "countryCode": string
        }
      },
      "score": string, // bigint, returned as string
      "pp": number,
      "globalRank": number
    }
  }
}
```

##### Example response (200):

`/scores/user/1`

```json
{
  "message": "Data retrieved successfully.",
  "data": {
    "score": {
      "scoreId": 1,
      "user": {
        "userId": 1,
        "userName": "Shigeru22",
        "osuId": 2581664,
        "country": {
          "countryId": 1,
          "countryName": "Indonesia",
          "countryCode": "ID"
        }
      },
      "score": "206202433453",
      "pp": 8641,
      "globalRank": 3884
    }
  }
}
```

##### Example response (400):

`/scores/user/a`

```json
{
  "message": "Invalid ID parameter."
}
```

##### Example response (404):

`/scores/user/100` (ID not in database)

```json
{
  "message": "User with specified ID can't be found."
}
```

## Get multiple users' scores

Retrieves multiple user scores by ID specified in query parameter. Also sorts them into a ranking list.

**Note:** If any user is not found in the database, it's considered as back active and wouldn't be returned in scores array.

#### GET `/scores/users`

##### Query Parameters

`users` **string**

User ID in the database, in form of arrays.
Example:
`[1, 2, 3]` as
`/scores/users?users=1&users=2&users=3` (must be multiple values) or
`/scores/users?users[]=1&users[]=2&users[]=3`

`sort` **string** *(optional, defaults to score)*

Sorting criteria. The available options are:

```
1 = score
2 = pp
```

##### Response format:

```
{
  "message": string,
  "data": {
    "score": {
      "scoreId": number,
      "user": {
        "userId": number,
        "userName": string,
        "osuId": number,
        "country": {
          "countryId": number,
          "countryName": string,
          "countryCode": string
        }
      },
      "score": string, // bigint, returned as string
      "pp": number,
      "globalRank": number
    },
    "length": number
  }
}
```

##### Example response (200):

**GET** `/scores/users?users=1&users=2&users=3`

Body:

```json
{
  "message": "Data retrieved successfully.",
  "data": {
    "scores": [
      {
        "scoreId": 2,
        "user": {
          "userId": 2,
          "userName": "Patience",
          "osuId": 13509913,
          "country": {
            "countryId": 2,
            "countryName": "Singapore",
            "countryCode": "SG"
          }
        },
        "score": "233011877962",
        "pp": 5074,
        "globalRank": 45789
      },
      {
        "scoreId": 1,
        "user": {
          "userId": 1,
          "userName": "Shigeru22",
          "osuId": 2581664,
          "country": {
            "countryId": 1,
            "countryName": "Indonesia",
            "countryCode": "ID"
          }
        },
        "score": "206202433453",
        "pp": 8641,
        "globalRank": 3884
      },
      {
        "scoreId": 3,
        "user": {
          "userId": 3,
          "userName": "StylishRENREN",
          "osuId": 17159233,
          "country": {
            "countryId": 3,
            "countryName": "Japan",
            "countryCode": "JP"
          }
        },
        "score": "155418273729",
        "pp": 7988,
        "globalRank": 6110
      }
    ]
  }
}
```

##### Example response (400):

**GET** `/scores/users?users[]=test` (Must be number)

Body:

```json
{
  "message": "Invalid users parameter."
}
```

##### Example response (404):

**GET** `/scores/users?users=10&users=11` (ID not in database)

Body:

```json
{
  "message": "No users found."
}
```

## Add user score

Inserts a new score in the database.

#### POST `/scores/add` **<ins>Auth</ins>**

##### Request body (JSON):

```
{
  "userId": number,
  "score": bigint | number,
  "pp": number,
  "globalRank": number
}
```

`userId` **number**

User ID in the database.

`score` **bigint** | **number**

Score to be inserted.

`pp` **number**

Current Performance Points (pp).

`globalRank` **number**

Current global rank.

##### Example response (200):

**POST** `/scores/add`

Body:

```json
{
  "userId": 8,
  "score": 260879391059,
  "pp": 6683,
  "globalRank": 15527
}
```

Response:

```json
{
  "message": "Data inserted successfully."
}
```

##### Example response (400):

```json
{
  "message": "Invalid POST data."
}
``` 

##### Example response (409):

```json
{
  "message": "Score with the specified osu! ID already exists."
}
```

##### Example response (500):

```json
{
  "message": "Data insertion failed."
}
```

## Delete user score

Removes a score from the database. **This will remove score's previous rank data!**

#### DELETE `/scores/delete` **<ins>Auth</ins>**

##### Request body (JSON):

```
{
  "scoreId": 1
}
```

`scoreId` **number**

Score ID in the database.

##### Example response (200):

**DELETE** `/scores/delete`

Body:

```json
{
  "scoreId": 1
}
```

Response:

```json
{
  "message": "Data deleted successfully."
}
```

##### Example response (400):

```json
{
  "message": "Invalid DELETE data."
}
```

##### Example response (500):

```json
{
  "message": "Data insertion failed."
}
```

## Delete all scores

Removes all scores in the database. **This will reset all scores, including previous rank data!**

#### DELETE `/scores/deleteall` **<ins>Auth</ins>**

##### Example response (200):

```json
{
  "message": "Data deleted successfully."
}
```

##### Example response (500):

```json
{
  "message": "Data deletion failed."
}
```