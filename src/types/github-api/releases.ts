import { IAuthorData } from "./structures";

export interface IGitHubReleasesData {
	url: string;
	html_url: string;
	assets_url: string;
	upload_url: string;
	tarball_url: string;
	zipball_url: string;
	id: number;
	node_id: string;
	tag_name: string;
	target_commitish: string;
	name: string;
	body: string;
	draft: boolean;
	prerelease: boolean;
	created_at: Date | string; // date, as ISO string
	published_at: Date | string;
	author: IAuthorData;
	assets: {
		url: string;
		browser_download_url: string;
		id: number;
		node_id: string;
		name: string;
		label: string;
		state: string;
		content_type: string;
		size: number;
		download_count: number;
		created_at: Date | string;
		updated_at: Date | string;
		uploader: IAuthorData;
	}[];
}
