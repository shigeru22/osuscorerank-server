import fs from "fs";

function main() {
	const data = fs.readFileSync("./deta/dist/index.js").toString().replace("exports.default", "module.exports");
	fs.writeFileSync("./deta/dist/index.js", data);
}

main();
