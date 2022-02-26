# Users

This route contains osu! inactive user information.

## Get all users

Retrieves all users in the database.

#### GET `/users`

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
      "country": {
        "countryId": 1,
        "countryName": "Indonesia",
        "countryCode": "ID"
      }
    }
  }
}
```

##### Example response (400):

`/users/a`

```json
{
  "message": "Invalid ID parameter."
}
```

##### Example response (404):

`/users/100` (ID not in database)

```json
{
  "message": "User with specified ID can't be found."
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

##### Example response (400):

```json
{
  "message": "Invalid POST data."
}
``` 

##### Example response (409):

```json
{
  "message": "User with the specified osu! ID already exists."
}
```

##### Example response (500):

```json
{
  "message": "Data insertion failed."
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
  "userId": 7
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

##### Example response (404):

```json
{
  "message": "User with specified ID can't be found."
}
```

##### Example response (500):

```json
{
  "message": "Data deletion failed."
}
```