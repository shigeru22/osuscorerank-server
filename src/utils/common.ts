import _ from "lodash";

export function checkNumber(data: unknown) {
	return _.isNumber(data) && !_.isNaN(data);
}

export function sleep(ms: number) {
	return new Promise(resolve => {
		setTimeout(resolve, ms);
	});
}
