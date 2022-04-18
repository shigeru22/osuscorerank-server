/* eslint-disable @typescript-eslint/no-var-requires */

const fs = require("fs");

function main() {
	if(!fs.existsSync("./dist/index.js")) {
		console.log("[ERROR] index.js/main :: dist/index.js not found.");
		console.log("[ERROR] index.js/main :: Make sure to build the project using this command and try again.");
		console.log("[ERROR] index.js/main ::     npm run build");
		console.log("[ERROR] index.js/main :: Note: Run the build command in root directory!\n");

		process.exit(1);
	}

	require("./dist/index.js");
}

main();
