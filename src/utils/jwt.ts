import jwt from "jsonwebtoken";
import env from "dotenv";
import _ from "lodash";

env.config();

export function generateAccessToken(id: string) {
	if(_.isUndefined(process.env.TOKEN_SECRET)) {
		return "";
	}

	return jwt.sign(id, process.env.TOKEN_SECRET, { expiresIn: "86400s" });
}
