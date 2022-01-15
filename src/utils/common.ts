import _ from "lodash";

export function checkNumber(data: unknown) {
	return _.isNumber(data) && !_.isNaN(data);
}
