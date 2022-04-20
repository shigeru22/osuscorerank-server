# Users

This route contains osu! inactive user information.

## Get all users

Retrieves all users in the database.

#### GET `/users`

##### Query Parameters

`desc` **boolean** *(optional, defaults to `false`)*

Sort descendingly by user ID.

`active` **string** *(optional, defaults to `all`)*

Query only users active, inactive, or both. Available options are:

```
true = (query only active users)
false = (query only inactive users)
all = (query everything)
```

##### Response format (JSON):

```
{
  "message": string,
  "data": {
    "users": {
      "userId": number,
      "userName": string,
      "osuId": number,
      "country": {
        "countryId": number,
        "countryName": string,
        "countryCode": string
      }
    }[],
    "length": number
  }
}
```

##### Example response (200):

```json
{
  {
    "message": "Data retrieved successfully.",
    "data": {
      "users": [
        {
          "userId": 1,
          "userName": "Shigeru22",
          "isActive": true,
          "osuId": 2581664,
          "country": {
            "countryId": 1,
            "countryName": "Indonesia",
            "countryCode": "ID"
          }
        },
        {
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
        {
          "userId": 3,
          "userName": "StylishRENREN",
          "osuId": 17159233,
          "isActive": true,
          "country": {
            "countryId": 3,
            "countryName": "Japan",
            "countryCode": "JP"
          }
        },
        // ...
      ],
      "length": 6
    }
  }
}
```

## Get user by country

Retrieves a user by country ID specified in route parameter.

#### GET `/users/country/{id}`

##### Route Parameters

`id` **string** *(optional, see above route)*

Country ID in the database.

`desc` **boolean** *(optional, defaults to `false`)*

Sort descendingly by user ID.

`active` **string** *(optional, defaults to `all`)*

Query only active users. Available options are:

- `true` (query only active users)
- `false` (query only inactive users)
- `all` (query everything)

##### Response format (JSON):

```
{
  "message": string,
  "data": {
    "country": {
      "countryId": number,
      "countryName": string,
      "countryCode": string
    },
    "users": {
      "userId": number,
      "userName": string,
      "osuId": number,
      "isActive": boolean
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
    "country": {
      "countryId": 1,
      "countryName": "Indonesia",
      "countryCode": "ID"
    },
    "users": [
      {
        "userId": 1,
        "userName": "Shigeru22",
        "osuId": 2581664,
        "isActive": true
      },
      {
        "userId": 2,
        "userName": "yandri",
        "osuId": 3824470,
        "isActive": false
      },
      // ...
    ],
    "length": 4
  }
}
```

## Get user by ID

Retrieves a user by ID specified in route parameter.

#### GET `/users/{id}`

##### Route Parameters

`id` **string** *(optional, see above route)*

User ID in the database.

##### Response format (JSON):

```
{
  "message": string,
  "data": {
    "user": {
      "userId": number,
      "userName": string,
      "osuId": number,
      "country": {
        "countryId": number,
        "countryName": string,
        "countryCode": string
      }
    }
  }
}
```

##### Example response (200):

`/users/1`

```json
{
  "message": "Data retrieved successfully.",
  "data": {
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
    }
  }
}
```

## Insert user

Inserts a new user to the database.

#### POST `/users/add` <ins>Auth</ins>

##### Request body (JSON):

```
{
  "userName": string,
  "osuId": number,
  "isActive": boolean,
  "countryId": number
}
```

`userName` **string**

osu! username.

`osuId` **number**

osu! user ID.

`countryId` **number**

Database country ID. Could be retrieved from [Countries section](4-countries.md).

##### Example response (200):

**POST** `/users/add`

Body:

```json
{
  "userName": "Akshiro",
  "osuId": 10557490,
  "countryId": 1
}
```

Response:

```json
{
  "message": "Data inserted successfully."
}
```

## Update user

Updates a user in the database.

#### PUT `/users/update` <ins>Auth</ins>

##### Request body (JSON):

```
{
  "userName": string,
  "osuId": number,
  "isActive": boolean,
  "countryId": number
}
```

##### Example response (200):

**POST** `/users/add`

Body:

```json
{
  "userName": "Akshiro",
  "osuId": 10557490,
  "isActive": true,
  "countryId": 1
}
```

Response:

```json
{
  "message": "Data inserted successfully."
}
```

## Delete user

Removes user from the database. Also deletes score related to deleted user.

#### DELETE `/users/delete` <ins>Auth</ins>

##### Request body (JSON):

```
{
  "userId": number
}
```

`userId` **number**

User ID in the database.

##### Example response (200):

**DELETE** `/users/delete`

Body:

```json
{
  "userId": 2
}
```

Response:

```json
{
  "message": "Data deleted successfully."
}
```