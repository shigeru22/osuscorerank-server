# Working with the Codebase

This section is intended for those who wanted to contribute to the codebase or host the API by themselves. For API usage, skip to [Endpoint section](2-endpoint.md).

## Preparing Development Environment (or self-hosting)

To get started, make sure to install [Node.js](https://nodejs.org/en/download) (tested using [v14.17.6](https://nodejs.org/dist/v14.17.6) with [NVM for Windows](https://github.com/coreybutler/nvm-windows)) and a database server (e.g. [PostgreSQL](https://www.postgresql.org/download), tested using v13.3, or [MySQL](https://dev.mysql.com/downloads), not tested). Afterwards do these steps:

1. Clone the repository.
2. Inside the repository folder, run this command install the dependencies.
`npm install`
This will install the dependencies (modules) used for the project.
3. Duplicate `.env-template` at the root folder and rename it as `.env`.
4. Open `.env` and modify the values in square brackets. The file provides documentation for those.
5. Start the database server, and run this command to synchronize the database with the provided schema.
`npx prisma db push`
6. Fetch the data required from osu! API (TBD). Alternatively, you can create a dummy data using TypeScript and Prisma Client, which types have been generated from the previous step. Documentation for those can be opened from this [link](https://www.prisma.io/docs/concepts/components/prisma-client/crud).
7. Run the API server in development mode using this command.
`npm run dev`

Before pushing changes or creating a pull request, make sure ESLint checks are passed in the project's repository. You can do this by executing this command.
`npx eslint .`
Alternatively, using Visual Studio Code, [ESLint extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) can be installed for realtime checking and linting.

## Project Structuring

The folder has the following structures:

- `/docs`, contains the documentation in Markdown format.
- `/prisma`, contains the schema used for database synchronization.
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

- `/utils/prisma` is used for querying data. The functions are used for files in `/controllers`. Do the queried data operation inside the controller and send the response from there.
- For non-controller related operation (like logging, common types, or common utilities) and frequently used, put them in `/utils` instead of per controller. If they are controller-specific, add them in its respective controller.
- Types and utilities are structured per usage or module. For example, `/types/prisma` for Prisma-related type, `/types/osu` for osu! API related type, and `/types` for API (Express) usages. Subsequent module types could be created in subfolders as before.

Some ESLint rules may be ignored if no alternatives could be used, for example:

- Final `NextFunction` in Express functions using middlewares aren't used, causing `no-unused-vars` warning. This can be disabled using single-line ESLint option.
- Doing `await` in looped `async` operations causes `no-await-in-loop` warning. Since this is needed in `osu.ts` to prevent rate abuse, this can be disabled like the previous problem.