# Environments

As stated in [Codebase](1-codebase.md) section, this server is intended to be run on DETA Micro. However, this project is set up to be flexible. For instance:

- DETA Micro expects Express.js object variable `app` to be exported without any `app.listen` calls.
- Setting up your own Node.js server (either for production or development purpose) requires `app.listen` calls in order to start the server itself.

Some of the environment variables are available for those cases. The environment variables template could be found in `.env-template` file located at the root of this repository.

## Environment Variables

Available environment variables are in the table below.

| Variable Name     | Type   | Description                                                         |
| -------------     | ----   | -----------                                                         |
| DETA_PROJECT_KEY  | string | DETA Project Key.                                                   |
| TOKEN_SECRET      | string | Secret used for JWT salt and dummy data insertion.                  |
| API_PORT          | number | Specifies a different port. If omitted, this will be set to `3000`. |
| OSU_CLIENT_ID     | number | osu! client ID.                                                     |
| OSU_CLIENT_SECRET | string | osu! client secret.                                                 |
| DEVELOPMENT       | number | Enables development mode.                                           |
| STANDALONE        | number | Enables standalone mode.                                            |

### DETA_PROJECT_KEY

DETA Project Key. This can be obtained during DETA project creation.

### TOKEN_SECRET

Secret token used for JWT salt and dummy data insertion credential. Created as explained in [Authentication](3-authentication.md) section.

### API_PORT

Specifies a different port. If omitted, the server will listen at port number `3000`.

### OSU_CLIENT_ID

osu! client ID. Could be obtained at [osu!](https://osu.ppy.sh) Account settings.

### OSU_CLIENT_SECRET

osu! client secret. Could be obtained at [osu!](https://osu.ppy.sh) Account settings.

### DEVELOPMENT

Enables development mode. This will output more verbose logging on operations ran during every requests.

### STANDALONE

Enables standalone mode. This enables server listening after running `npm run dev` or `npm start`.

**This should be enabled if the server is running as long-running process.**