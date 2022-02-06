# Countries

This route contains country data, which is used for user's country relation.

## Get all countries

Retrieves all countries in the database.

#### GET `/countries`

##### Response format (JSON):

```json
{
  "message": string,
  "data": {
    "countries": {
      "countryId": number,
      "countryName": string,
      "recentlyInactive": number
    }[],
    "total": number
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
        "recentlyInactive": 3
      },
      {
        "countryId": 2,
        "countryName": "Singapore",
        "recentlyInactive": 1
      },
      {
        "countryId": 3,
        "countryName": "Japan",
        "recentlyInactive": 1
      },
      {
        "countryId": 4,
        "countryName": "United States",
        "recentlyInactive": 1
      }
    ],
    "total": 4
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

```json
{
  "message": string,
  "data": {
    "country": {
      "countryId": number,
      "countryName": string,
      "recentlyInactive": number
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
      "recentlyInactive": 3
    }
  }
}
```

##### Example response (400):

`/countries/a`

```json
{
  "message": "Invalid ID parameter."
}
```

##### Example response (404):

`/countries/100` (ID not in database)

```json
{
  "message": "Country with specified ID can't be found."
}
```

## Add country

Inserts a new country to the database.

#### POST `/countries/add` <ins>Auth</ins>

##### Request body (JSON):

```json
{
  "countryName": string
}
```

`countryName` **string**

Country Name.

##### Example response (200):

**POST** `/countries/add`

Body:

```json
{
  "countryName": "Malaysia"
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

##### Example response (500):

```json
{
  "message": "Data insertion failed."
}
```

## Delete country

Removes a country from the database. Also deletes users and scores related to that country.

#### DELETE `/countries/add` <ins>Auth</ins>

##### Request body (JSON):

```json
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
  "countryId": 4
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
  "message": "Country with specified ID can't be found."
}
```

##### Example response (500):

```json
{
  "message": "Data deletion failed."
}
```

## Reset countries

Removes all countries. **This essentially deletes everything!**

#### DELETE `/countries/deleteall` <ins>Auth</ins>

##### Example response (200):

Response:

```json
{
  "message": "Data deleted successfully."
}
```

##### Example response (404):

```json
{
  "message": "No countries to delete."
}
```

##### Example response (500):

```json
{
  "message": "Data deletion failed."
}
```