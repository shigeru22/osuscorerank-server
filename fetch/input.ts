/* eslint-disable consistent-return */

import inquirer from "inquirer";
import _ from "lodash";

export async function inputNumber(promptText: string, validCallback: (ret: number) => boolean): Promise<number> {
	try {
		let condition = false;
		let ret = 0;

		while(!condition) {
			// eslint-disable-next-line no-await-in-loop
			const input = await inquirer.prompt([
				{
					name: "data",
					message: promptText
				}
			]);

			const tempNumber = _.parseInt(input.data, 10);
			if(_.isNaN(tempNumber)) {
				console.log("Input is not number.");
			}
			else if(!validCallback(tempNumber)) {
				console.log("Input is not valid.");
			}
			else {
				ret = tempNumber;
				condition = true;
			}
		}

		return ret;
	}
	catch (e) {
		if(_.isError(e)) {
			console.log(`${ e.name }: ${ e.message }`);
		}
		else {
			console.log("Unknown error occurred.");
		}

		process.exit(1);
	}
}

export async function inputText(promptText: string, validCallback?: (ret: string) => boolean): Promise<string> {
	try {
		let condition = false;
		let ret = "";

		while(!condition) {
			// eslint-disable-next-line no-await-in-loop
			const input = await inquirer.prompt([
				{
					name: "data",
					message: promptText
				}
			]);

			if(!_.isUndefined(validCallback) && !validCallback(input.data)) {
				console.log("Input is not valid.");
			}
			else {
				ret = input.data;
				condition = true;
			}
		}

		return ret;
	}
	catch (e) {
		if(_.isError(e)) {
			console.log(`${ e.name }: ${ e.message }`);
		}
		else {
			console.log("Unknown error occurred.");
		}

		process.exit(1);
	}
}
