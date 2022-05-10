import fs from "fs";
import _ from "lodash";
import { IUserStatistics } from "../src/types/osu/osu-structures";

/* path is relative path from node execution. always run using npm run fetch! */
export function exportRankingsData(data: IUserStatistics[], path: string) {
	if(!path.endsWith(".json")) {
		console.log("[ERROR] exportRankingsData :: path must end with .json.");
		return false;
	}

	let tempPath = path.slice(); // prevent argument mutation
	if(path.startsWith("../")) {
		console.log("[ERROR] exportRankingData :: Never export to parent directory. This may cause file location ambiguity.");
		return false;
	}
	else if(path.startsWith("/")) {
		tempPath = tempPath.slice(1);
	}
	else if(path.startsWith("./")) {
		tempPath = tempPath.slice(2);
	}

	const pathArray = tempPath.split("/");
	const len = pathArray.length;

	try {
		pathArray.forEach((dir, index) => {
			if(index === len - 1) {
				fs.writeFileSync(`./${ pathArray.slice(0, index).join("/") }/${ dir }`, JSON.stringify(data, null, 2));
			}
			else {
				const currDirPath = `./${ pathArray.slice(0, index + 1).join("/") }`;
				if(!fs.existsSync(currDirPath)) {
					fs.mkdirSync(currDirPath);
				}
			}
		});
	}
	catch (e) {
		if(_.isError(e)) {
			console.log(`[ERROR] exportRankingsData :: ${ e.name }: ${ e.message }\n${ e.stack }`);
		}
		else {
			console.log("[ERROR] exportRankingsData :: Unknown error occurred.");
		}

		return false;
	}

	return true;
}

export function importRankingsData(path: string) {
	if(!path.endsWith(".json")) {
		console.log("[ERROR] importRankingsData :: path must end with .json.");
		return null;
	}

	let tempPath = path.slice(); // prevent argument mutation
	if(path.startsWith("../")) {
		console.log("[ERROR] importRankingData :: Never import from parent directory. This may cause file location ambiguity.");
		return null;
	}
	else if(path.startsWith("/")) {
		tempPath = tempPath.slice(1);
	}
	else if(path.startsWith("./")) {
		tempPath = tempPath.slice(2);
	}

	if(!fs.existsSync(tempPath)) {
		console.log("[ERROR] importRankingData :: path not found.");
		return null;
	}

	const tempData = JSON.parse(fs.readFileSync(tempPath, { encoding: "utf8" })) as IUserStatistics[];
	return tempData;
}
