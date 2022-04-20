# Updates

This route contains recent updates data, mainly used for versioning.

## Notes about updates

Every score is assigned with an update ID. This provides versioning system for all scores retrieved at specified date.

Another important field is `online` field, which is a boolean value used to specify whether the update is finalized and ready for any purposes. This also meant that any data manipulation operations to scores (for example, inserting and deleting scores), is not available on online'd update ID.

By default, all score queries only query latest updates with online'd status. This can be overridden using those respective query parameters.

## Get latest update data

Retrieves current update data.

#### GET `/updates`

##### Query Parameters

`online` **boolean** *(optional, defaults to `true`)*

Query online (finalized) data.

##### Response format (JSON):

```
{
  "message": string,
  "data": {
    "date": string, // date returned as ISO string
    "apiVersion": string,
    "webVersion": string,
    "online": boolean
  }
}
```

##### Example response (200):

```json
{
  "message": "Data retrieved successfully.",
  "data": {
    "updateData": {
      "date": "2022-04-19T04:55:08.006Z",
      "apiVersion": "1.0.0",
      "webVersion": "1.0.0",
      "online": true
    }
  }
}
```

## Get all updates

Retrieves all update data (including not yet online).

#### GET `/updates/all`

##### Response format (JSON):

```
{
  "message": string,
  "data": {
    "updatesData": {
      "date": string, // date returned as ISO string
      "apiVersion": string,
      "webVersion": string,
      "online": boolean
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
    "updatesData": [
      {
        "date": "2022-04-19T04:55:08.006Z",
        "apiVersion": "1.0.0",
        "webVersion": "1.0.0",
        "online": false
      }
    ],
    "length": 1
  }
}
```

## Get update by ID

Retrieves update data by ID.

#### GET `/updates/{id}`

##### Response format (JSON):

```
{
  "message": string,
  "data": {
    "date": string, // date returned as ISO string
    "apiVersion": string,
    "webVersion": string,
    "online": boolean
  }
}
```

##### Example response (200):

```json
{
  "message": "Data retrieved successfully.",
  "data": {
    "updateData": {
      "date": "2022-04-19T04:55:08.006Z",
      "apiVersion": "1.0.0",
      "webVersion": "1.0.0",
      "online": true
    }
  }
}
```

## Add update data

Creates new update data.

**Note:** Once update data point is created, it will be unable to be deleted since many scores are tied to this update data. It's still possible to delete them manually through DETA Base GUI.

#### POST `/updates/add` <ins>Auth</ins>

##### Request body (JSON):

```
{
  // none
}
```

##### Example response (200):

```json
{
  "message": "Data inserted successfully."
}
```

## Set update data online status

Sets online status of an update data. Also sets date field to request time and date.

#### PUT `/updates/setonline` <ins>Auth</ins>

##### Request body (JSON):

```
{
  "updateId": number,
  "online": boolean
}
```

##### Example response (200):

```json
{
  "message": "Data updated successfully."
}
```