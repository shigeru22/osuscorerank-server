# Countries

This route contains country data, which is used for user's country relation.

## Get all countries

Retrieves all countries in the database.

#### GET `/countries`

##### Response format (JSON):

```
{
  "message": string,
  "data": {
    "countries": {
      "countryId": number,
      "countryName": string,
      "countryCode": string
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
    "countries": [
      {
        "countryId": 1,
        "countryName": "Indonesia",
        "countryCode": "ID"
      },
      {
        "countryId": 2,
        "countryName": "Singapore",
        "countryCode": "SG"
      },
      {
        "countryId": 3,
        "countryName": "Japan",
        "countryCode": "JP"
      },
      {
        "countryId": 4,
        "countryName": "United States",
        "countryCode": "US"
      }
    ],
    "length": 4
  }
}
```

## Get country by ID

Retrieves a country by ID specified in route parameter.

#### GET `/countries/{id}`

##### Route Parameters

`id` **string** *(optional, see above route)*

Country ID in the database.

##### Response format (JSON):

```
{
  "message": string,
  "data": {
    "country": {
      "countryId": number,
      "countryName": string,
      "countryCode": string
    }
  }
}
```

##### Example response (200):

`/countries/1`

```json
{
  "message": "Data retrieved successfully.",
  "data": {
    "country": {
      "countryId": 1,
      "countryName": "Indonesia",
      "countryCode": "ID"
    }
  }
}
```

## Add country

Inserts a new country to the database.

#### POST `/countries/add` <ins>Auth</ins>

##### Request body (JSON):

```
{
  "countryName": string,
  "countryCode": string
}
```

`countryName` **string**

Country Name.

`countryCode` **string**

Country Code. Must be 2-letter code in ISO 3166-1 Alpha-2 format for integrity. Full listing [here](https://en.wikipedia.org/w/index.php?title=List_of_ISO_3166_country_codes#Current_ISO_3166_country_codes).

##### Example response (200):

**POST** `/countries/add` <ins>Auth</ins>

Body:

```json
{
  "countryName": "Malaysia",
  "countryCode": "MY"
}
```

Response:

```json
{
  "message": "Data inserted successfully."
}
```

## Delete country

Removes a country from the database. Also deletes users and scores related to that country.

#### DELETE `/countries/add` <ins>Auth</ins>

##### Request body (JSON):

```
{
    "countryId": number
}
```

`countryId` **string**

Country ID in the database.

##### Example response (200):

**DELETE** `/countries/delete`

Body:

```json
{
  "countryId": 5
}
```

Response:

```json
{
  "message": "Data deleted successfully."
}
```