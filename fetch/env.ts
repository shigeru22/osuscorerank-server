import _ from "lodash";

export function envCheck() {
	if(_.isUndefined(process.env.OSU_CLIENT_ID) || _.isEmpty(process.env.OSU_CLIENT_ID)) {
		console.log("OSU_CLIENT_ID must be defined in environment variables.");
		return false;
	}

	{
		const clientId = _.parseInt(process.env.OSU_CLIENT_ID, 10);
		if(_.isNaN(clientId) || clientId <= 0) {
			console.log("Invalid OSU_CLIENT_ID value.");
			return false;
		}
	}

	if(_.isUndefined(process.env.OSU_CLIENT_SECRET) || _.isEmpty(process.env.OSU_CLIENT_SECRET)) {
		console.log("OSU_CLIENT_ID must be defined in environment variables.");
		return false;
	}

	return true;
}

export function envDetaCheck() {
	if(_.isUndefined(process.env.DETA_PROJECT_KEY) || _.isEmpty(process.env.DETA_PROJECT_KEY)) {
		console.log("DETA_PROJECT_KEY must be defined in environment variables.");
		return false;
	}

	return true;
}
