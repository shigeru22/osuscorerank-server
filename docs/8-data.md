# Creating Dummy Data

Once the server is created, dummy data could be inserted to DETA Base to apply the database to the cloud. This is also important in order to create a client credentials data for authenticating with the API.

## Endpoint

Below is the endpoint used to insert the dummy data.

**Note:** If any data already exists, this endpoint will return `500` HTTP status code. This is intended to prevent unauthorized data insertion.

#### POST `/dummy`

##### Request body (JSON):

```
{
  "secret": string,
}
```

> Make sure to use your generated token in `.env` file as the `secret` value!

##### Example response (200):

```json
{
  "message": "Dummy data inserted successfully."
}
```


# About Data Updates

Since this API requires data from osu! API, those data need to be fetched and processed in the API server. This is intended to prevent abuse to osu! servers.

## Updating new data

Data fetching could be run by running this command.

```shell
$ npm run fetch
```

Follow the instructions on the terminal screen. What the script does:

1. Fetch the data from osu! API and export it as `/dist/ranking.json`.
2. Process the JSON data into database based on `/country.json` file.