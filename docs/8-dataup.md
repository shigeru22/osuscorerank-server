# About Data Updates

Since this API requires data from osu! API, those data need to be fetched and processed in the API server. This is intended to prevent abuse to osu! servers.

## Updates Route

If you noticed the project structure, there are 4 main routes (including controllers and their respective utils). One of those routes however, only provides route to fetch the latest update data, but not inserting or updating them.

The reason for this is the data that actually being fetched in regular basis. Not relying on API calls, the updates are performed using CLI instead of API interface [TBD].

After running the data fetching and updating them, new update record will be created to the database using `insertUpdate()` function in `/src/utils/prisma/updates.ts` module.