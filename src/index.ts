import express from "express";
import env from "dotenv";
import cors from "cors";
import _ from "lodash";
import mainRoute from "./routes/main";
import scoreRoute from "./routes/scores";
import userRoute from "./routes/users";
import countryRoute from "./routes/countries";
import authRoute from "./routes/auth";
import updateRoute from "./routes/updates";
import { LogLevel, log } from "./utils/log";

env.config();

const app = express();
const PORT = process.env.API_PORT || 5000;

/* middlewares */
app.use(express.json());
app.use(cors());

/* routes */
app.use("/", mainRoute);
app.use("/scores", scoreRoute);
app.use("/users", userRoute);
app.use("/countries", countryRoute);
app.use("/auth", authRoute);
app.use("/updates", updateRoute);

/* environment check */
function checkEnv() {
	const port = _.isUndefined(process.env.API_PORT) ? undefined : _.parseInt(process.env.API_PORT, 10);
	const dev = _.isUndefined(process.env.DEVELOPMENT) ? undefined : _.parseInt(process.env.DEVELOPMENT, 10);

	if(_.isUndefined(port)) {
		log("API_PORT must be defined in environment. Exiting.", LogLevel.ERROR);
		return false;
	}

	if(_.isNaN(port)) {
		log("API_PORT must be number. Exiting.", LogLevel.ERROR);
		return false;
	}

	if(port <= 0) {
		log("API_PORT must be valid number value. Exiting.", LogLevel.ERROR);
		return false;
	}

	if(_.isUndefined(dev)) {
		log("DEVELOPMENT must be defined in environment. Exiting.", LogLevel.ERROR);
		return false;
	}

	if(_.isNaN(dev)) {
		log("DEVELOPMENT must be number (0 or 1). Exiting.", LogLevel.ERROR);
		return false;
	}

	if(dev < 0 || dev > 1) {
		log("DEVELOPMENT must be 0 or 1. Exiting.", LogLevel.ERROR);
		return false;
	}

	if(dev === 1) {
		log("Running in development mode.", LogLevel.WARN);
	}

	return true;
}

if(!checkEnv()) {
	process.exit();
}

app.listen(PORT, () => {
	log(`Server is running at port ${ PORT }`, LogLevel.LOG);
});
