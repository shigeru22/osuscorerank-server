import axios from "axios";
import _ from "lodash";
import { IGitHubReleasesData } from "../../types/github-api/releases";
import { HTTPStatus } from "../http";
import { log, LogSeverity } from "../log";

export async function getRepositoryReleases(owner: string, repository: string, silent = false) {
	if(!silent) {
		log(`Latest release of ${ owner }/${ repository } requested.`, "getLatestRelease", LogSeverity.LOG);
	}

	try {
		const response = await axios.get<IGitHubReleasesData[]>(`https://api.github.com/repos/${ owner }/${ repository }/releases`, {
			headers: {
				"Accept": "application/vnd.github.v3+json"
			}
		});

		if(response.status !== HTTPStatus.OK) {
			log(`API returned status ${ response.status }`, "getAccessToken", LogSeverity.WARN);
			log(`Response data:\n${ JSON.stringify(response.data) }`, "getAccessToken", LogSeverity.DEBUG);

			return null;
		}

		if(!silent) {
			log(`Releases of ${ owner }/${ repository } retrieved successfully.`, "getLatestRelease", LogSeverity.LOG);
		}

		return response.data;
	}
	catch (e) {
		if(axios.isAxiosError(e)) {
			if(!_.isUndefined(e.response)) {
				log(`API returned status ${ e.response.status }.`, "getLatestRelease", LogSeverity.ERROR);
				log(`Response data:\n${ JSON.stringify(e.response.data) }`, "getLatestRelease", LogSeverity.DEBUG);
			}
			else {
				log("API returned undefined status code.", "getLatestRelease", LogSeverity.ERROR);
			}
		}
		else if(_.isError(e)) {
			log(`An error occurred while requesting GitHub releases. Error details below.\n${ e.name }: ${ e.message }${ process.env.DEVELOPMENT === "1" ? `\n${ e.stack }` : "" }`, "getLatestRelease", LogSeverity.ERROR);
		}
		else {
			log("Unknown error occurred while requesting GitHub releases.", "getLatestRelease", LogSeverity.ERROR);
		}

		return null;
	}
}
