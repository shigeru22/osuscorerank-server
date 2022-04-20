# Working with the Codebase

This section is intended for those who wanted to contribute to the codebase or host the API by themselves. For API usage, skip to [Endpoint section](2-endpoint.md).

## Preparing Development Environment

To get started, make sure to install [Node.js](https://nodejs.org/en/download) (tested using [v14.17.6](https://nodejs.org/dist/v14.17.6) with [NVM for Windows](https://github.com/coreybutler/nvm-windows)). For storing data, this project uses DETA Base, as part of [DETA Cloud](https://www.deta.sh) platform. Previously, this project uses Prisma as the database ORM, with [this commit](https://github.com/shigeru22/osuinactive-api/commit/3e123792b6bd3e4c84b6a2582b0e354b15bd7dd3) as the last commit using that.

After installing Node.js, prepare the environment with these steps.

1. Clone the repository.
2. Inside the repository folder, run this command install the dependencies used for the project.

    ```shell
    $ npm install
    ```

3. Duplicate `.env-template` at the root folder and rename it as `.env`.
4. Open `.env` and modify the values in square brackets. The file provides documentation for those.
5. Start the database server, and run this command to synchronize the database with the provided schema.

    ```shell
    $ npx prisma db push
    ```

6. Run the API server in development mode using this command.

    ```shell
    $ npm run dev
    ```

For first time setup, also do these steps:

1. Create the dummy data in the database. This is important to create a client credentials used to access the data manipulation API. Details can be found in [Data](8-data.md) section.

2. Fetch the data from osu! API. Details about this also can be found in [Data](8-data.md) section.

Before pushing changes or creating a pull request, make sure ESLint checks are passed in the project's repository. You can do this by executing this command.

```shell
$ npx eslint .
```

Alternatively, using Visual Studio Code, [ESLint extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) can be installed for realtime checking and linting.

## Production

This repository has been set up for DETA Micros deployment. For production purposes, the project could be built using these steps.

1. Make sure `client` submodule has been cloned. Create `.env` file in that directory and fill with the following value.

    ```
    BUILD_PATH=../dist/client
    ```

    This will output the build to `dist` directory at the root repository folder.

2. Start the build using this command at the API directory.

    ```shell
    $ npm run build
    ```

3. Open `/dist/index.js` and change this syntax:

    ```js
    exports.default = app;
    ```

    Into this syntax:

    ```js
    module.exports = app;
    ```

4. Remove `.deta` folder from this repository for deploying yourself to DETA Micro. Afterwards, run this command to create a new micro at DETA cloud.

    ```shell
    $ deta new --node --project [your project name]
    ```

    This will overwrite the root `index.js` file. The changes must be discarded as it contains the entry point to `/dist/index.js`.

5. Deploy to DETA Micro using this command.

    ```shell
    $ deta deploy
    ```

Alternatively, you may build this repository and the [client](https://github.com/shigeru22/osu-inactive-score) separately, and deploy them manually. Note that `index.js` used as the main entry point is intended for DETA Micros or [Vercel](https://vercel.com) as those expects the `app` object to be exported as a single `module.exports` expression.

Alternate server execution entry point will be added soon.

## Project Structuring

The folder has the following structures:

- `/client`, contains the client submodule.
- `/docs`, contains the documentation in Markdown format.
- `/src`, contains the API source code.
  - `/controllers`, contains controllers (main actions for certain routes).
  - `/middleware`, contains middleware (certain actions that could be run before others).
  - `/routes`, contains routes (URL naming and its targets).
  - `/types`, contains TypeScript type declarations. May be put in subfolders for usage with modules or certain classifications.
  - `/utils`, contains generic non-controller related utilities to be used in other modules. May be put in subfolders for usage with modules or certain classifications.
- `.env`, the file used to declare project's (development) environment variables.
- `.eslintrc.js`, provides rules to format and lint files.
- `.gitignore`, prevents certain files and folders from being staged in Git.
- `README.md`, the repository's main README.
- `tsconfig.json`, provides TypeScript configurations.

The usages for those directories are strict—make sure to follow those descriptions in each folder. For example:

- `/utils/deta` is used for querying data. The functions are used for files in `/controllers`. Do the queried data operation inside the controller and send the response from there.
- For non-controller related operation (like logging, common types, or common utilities) and frequently used, put them in `/utils` instead of per controller. If they are controller-specific, add them at the end of its respective controller.
- Types and utilities are structured per usage or module. For example, `/types/deta` for query-related type, `/types/osu` for osu! API related type, and `/types` for API (Express) usages. Subsequent module types could be created in subfolders as before.

Some ESLint rules may be ignored if no alternatives could be used, for example:

- Final `NextFunction` veriable in Express functions using middlewares aren't used, causing `no-unused-vars` warning. In order for middlewares to work, the variable needs to be present. As such, this can be disabled using single-line ESLint option.
- Doing `await` in looped `async` operations causes `no-await-in-loop` warning. Since this is needed in `osu.ts` to prevent rate abuse, this can be disabled like the previous problem.