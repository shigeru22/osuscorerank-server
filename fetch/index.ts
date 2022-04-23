import { inputNumber, inputText } from "./input";

async function main() {
	console.clear();

	console.log("osu! Score Rank API Data Fetcher\n");
	console.log("  1. Fetch data from osu! API");
	console.log("  2. Import data from temp/rankings.json");
	console.log("  0. Exit\n");

	const input = await inputNumber("Input:", id => id >= 0 && id <= 2);
	switch(input) {
		case 0: process.exit(0);
	}
}

main();
