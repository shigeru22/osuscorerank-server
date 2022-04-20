# Endpoint

Base URL for the API are the following.

`[TBD]` 

The following routes are available for the API.

- `/auth`: Authentication
- `/countries/{id}`: Countries
- `/users/{id}`: Users
- `/scores/{id}`: Score ranking (global)
- `/scores/country/{id}`: Score ranking (per country)
- `/scores/user/{id}`: Score (per user)
- `/updates/{id}`: Database updates

The following routes are available, requiring authentication as described in [Authentication section](3-authentication.md).

- `/countries/add`: Add countries
- `/countries/delete`: Delete countries
- `/users/add`: Add users
- `/users/update`: Update users
- `/users/delete`: Delete users
- `/scores/add`: Add scores
- `/scores/delete`: Delete scores
- `/scores/deleteall`: Delete all scores
- `/updates/add`: Add update data
- `/updates/setonline`: Set update data status
- `/status`: Server status

Using non-authentication method, the following routes are available.

- `/dummy`: Create dummy data for DETA Base
