# Updates

This route contains recent updates data, primarily for use in [Inactive User Rankings](https://github.com/shigeru22/osu-inactive-score) data.

## Get latest update data

Retrieves current versions.

#### GET `/updates`

##### Response format (JSON):

```
{
  "message": string,
  "data": {
    "date": string, // ISO Date returned as string
    "apiVersion": string,
    "webVersion": string
  }
}
```

##### Example response (200):

```json
{
  "message": "Data retrieved successfully.",
  "data": {
    "date": "2022-02-05T05:40:58.842Z",
    "apiVersion": "0.1.0",
    "webVersion": "0.1.0"
  }
}
```

##### Example response (500):

```json
{
  "message": "Empty updates record."
}
```