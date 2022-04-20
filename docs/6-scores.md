# Scores

This route contains inactive users score listing (and ranking).

## Get all scores (global)

Retrieves all score in the database. Essentially everything, or global score in general. The queried results are either sorted by score or by Performance Points (pp), creating a ranking list.

Since this is a global ranking list, also returns number of inactive users. Delta calculation is also provided from previously refreshed ranking state.

#### GET `/scores`

##### Query Parameters

`active` **string** *(optional, defaults to `all`)*

Query only users active, inactive, or both. Available options are:

```
true = (query only active users)
false = (query only inactive users)
all = (query everything)
```

`sort` **number** *(optional, defaults to score)*

Sorting criteria. The available options are:

```
1 = id
2 = score
3 = pp
4 = date
```

`desc` **boolean** *(optional, defaults to `false`)*

Sort descendingly by specified sorting criteria.

`updateid` **number** *(optional, defaults to any latest online update)*

Update ID to query data on. Details about update ID and how data is stored can be found in [Updates](7-updates.md) section.

##### Response format (JSON):

```
{
  "message": string,
  "data": {
    "scores": {
      "scoreId": number,
      "user": {
        "userId": number,
        "userName": string,
        "osuId": number,
        "isActive": boolean,
        "country": {
          "countryId": number,
          "countryName": string,
          "countryCode": string
        }
      },
      "score": string, // bigint, returned as string
      "pp": number
    }[],
    "length": number
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
          "isActive": true,
          "country": {
            "countryId": 4,
            "countryName": "United States",
            "countryCode": "US"
          }
        },
        "score": "970375021269",
        "pp": 9486
      },
      {
        "scoreId": 6,
        "user": {
          "userId": 6,
          "userName": "Venta",
          "osuId": 11320627,
          "isActive": true,
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
          "isActive": true,
          "country": {
            "countryId": 2,
            "countryName": "Singapore",
            "countryCode": "SG"
          }
        },
        "score": "233011877962",
        "pp": 5074
      },
      // ...
    ],
    "total": 6
  }
}
```

## Get country scores

Retrieves all score in the database by country specified in route parameter.

#### GET `/scores/country/{id}`

##### Route Parameters

`id` **string**

Country ID in the database.

##### Query Parameters

`active` **string** *(optional, defaults to `all`)*

Query only users active, inactive, or both. Available options are:

```
true = (query only active users)
false = (query only inactive users)
all = (query everything)
```

`sort` **number** *(optional, defaults to score)*

Sorting criteria. The available options are:

```
1 = id
2 = score
3 = pp
4 = date
```

`desc` **boolean** *(optional, defaults to `false`)*

Sort descendingly by specified sorting criteria.

`updateid` **number** *(optional, defaults to any latest online update)*

Update ID to query data on. Details about update ID and how data is stored can be found in [Updates](7-updates.md) section.

##### Response format:

```
"message": string,
  "data": {
    "country": {
      "countryId": number,
      "countryName": string,
      "countryCode": string
    },
    "scores": {
      "scoreId": number,
      "user": {
        "userId": number,
        "userName": string,
        "osuId": number,
        "isActive": boolean
      },
      "score": string, // bigint, returned as string
      "pp": number
    },
    "length": number
  }
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
          "osuId": 11320627,
          "isActive": true
        },
        "score": "116841606315",
        "pp": 10189
      },
      {
        "scoreId": 1,
        "user": {
          "userId": 1,
          "userName": "Shigeru22",
          "osuId": 2581664,
          "isActive": true
        },
        "score": "48738707596",
        "pp": 8645
      },
      {
        "scoreId": 5,
        "user": {
          "userId": 5,
          "userName": "Itsakaseru",
          "osuId": 6932675,
          "isActive": true
        },
        "score": "18100972154",
        "pp": 9207
      }
    ],
    "length": 3
  }
}
```

## Get user score

Retrieves user score by ID specified in route parameter.

#### GET `/scores/user/{id}`

##### Route Parameters

`id` **string**

User ID in the database.

##### Query Parameters

`updateid` **number** *(optional, defaults to any latest online update)*

Update ID to query data on. Details about update ID and how data is stored can be found in [Updates](7-updates.md) section.

##### Response format:

```
"message": string,
  "data": {
    "country": {
      "countryId": number,
      "countryName": string,
      "countryCode": string
    },
    "scores": {
      "scoreId": number,
      "user": {
        "userId": number,
        "userName": string,
        "osuId": number,
        "isActive": boolean
      },
      "score": string, // bigint, returned as string
      "pp": number
    },
    "length": number
  }
}
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
        "isActive": boolean,
        "country": {
          "countryId": number,
          "countryName": string,
          "countryCode": string
        }
      },
      "score": string, // bigint, returned as string
      "pp": number
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
        "isActive": true,
        "country": {
          "countryId": 1,
          "countryName": "Indonesia",
          "countryCode": "ID"
        }
      },
      "score": "206202433453",
      "pp": 8641
    }
  }
}
```

## Get multiple users' scores

Retrieves multiple user scores by ID specified in query parameter. Also sorts them into a ranking list.

**Note:** Any users not found will not be returned in `score` array.

#### GET `/scores/users`

##### Query Parameters

`users` **string[]**

User ID in the database, in form of arrays.

Example:
`[1, 2, 3]` as
`/scores/users?users=1&users=2&users=3` (must be multiple values) or
`/scores/users?users[]=1&users[]=2&users[]=3`

`sort` **number** *(optional, defaults to score)*

Sorting criteria. The available options are:

```
1 = id
2 = score
3 = pp
4 = date
```

`desc` **boolean** *(optional, defaults to `false`)*

Sort descendingly by specified sorting criteria.

`updateid` **number** *(optional, defaults to any latest online update)*

Update ID to query data on. Details about update ID and how data is stored can be found in [Updates](7-updates.md) section.

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
        "isActive": boolean,
        "country": {
          "countryId": number,
          "countryName": string,
          "countryCode": string
        }
      },
      "score": string, // bigint, returned as string
      "pp": number
    }[],
    "length": number
  }
}
```

##### Example response (200):

**GET** `/scores/users?users=1&users=6`

Body:

```json
{
  "message": "Data retrieved successfully.",
  "data": {
    "scores": [
      {
        "scoreId": 6,
        "user": {
          "userId": 6,
          "userName": "Venta",
          "osuId": 11320627,
          "isActive": true,
          "country": {
            "countryId": 1,
            "countryName": "Indonesia",
            "countryCode": "ID"
          }
        },
        "score": "116841606315",
        "pp": 10189
      },
      {
        "scoreId": 1,
        "user": {
          "userId": 1,
          "userName": "Shigeru22",
          "osuId": 2581664,
          "isActive": true,
          "country": {
            "countryId": 1,
            "countryName": "Indonesia",
            "countryCode": "ID"
          }
        },
        "score": "48738707596",
        "pp": 8645
      }
    ],
    "length": 2
  }
}
```

## Add user score

Inserts a new score in the database.

**Note:** Latest update ID with non-finalized data must be exist. Details about update ID and how data is stored can be found in [Updates](7-updates.md) section.

#### POST `/scores/add` **<ins>Auth</ins>**

##### Request body (JSON):

```
{
  "userId": number,
  "score": bigint | number,
  "pp": number
}
```

`userId` **number**

User ID in the database.

`score` **bigint** | **number**

Score to be inserted.

`pp` **number**

Current Performance Points (pp).

##### Example response (200):

**POST** `/scores/add`

Body:

```json
{
  "userId": 2,
  "score": 21637451299,
  "pp": 6287
}
```

Response:

```json
{
  "message": "Data inserted successfully."
}
```

## Delete user score

Removes a score from the database.

**Note:** Latest update ID with non-finalized data must be exist. Details about update ID and how data is stored can be found in [Updates](7-updates.md) section.

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