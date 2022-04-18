import express from "express";
import env from "dotenv";
import cors from "cors";
import _ from "lodash";
import { getNotFoundMessage } from "./controllers/main";
import mainRoute from "./routes/main";
import countryRoute from "./routes/countries";
import userRoute from "./routes/users";
import scoreRoute from "./routes/scores";
import updateRoute from "./routes/updates";
import authRoute from "./routes/auth";
import statusRoute from "./routes/status";
import { LogSeverity, log } from "./utils/log";

env.config();

const app = express();
const PORT = process.env.API_PORT || 5000;

/* middlewares */
app.use(express.json());
app.use(cors());

/* routes */
app.use("/api/", mainRoute);
app.use("/api/countries", countryRoute);
app.use("/api/users", userRoute);
app.use("/api/scores", scoreRoute);
app.use("/api/updates", updateRoute);
app.use("/api/auth", authRoute);
app.use("/api/status", statusRoute);

app.use("/api/*", getNotFoundMessage);

app.use("*", (req, res) => {
	res.send("React endpoint goes here");
});

/* environment check */
function checkEnv() {
	log("Checking environment variables...", "checkEnv", LogSeverity.LOG);

	const port = _.isUndefined(process.env.API_PORT) ? undefined : _.parseInt(process.env.API_PORT, 10);
	const dev = _.isUndefined(process.env.DEVELOPMENT) ? undefined : _.parseInt(process.env.DEVELOPMENT, 10);

	if(_.isUndefined(port)) {
		log("API_PORT must be defined in environment. Exiting.", "checkEnv", LogSeverity.ERROR);
		return false;
	}

	if(_.isNaN(port)) {
		log("API_PORT must be number. Exiting.", "checkEnv", LogSeverity.ERROR);
		return false;
	}

	if(port <= 0) {
		log("API_PORT must be valid number value. Exiting.", "checkEnv", LogSeverity.ERROR);
		return false;
	}

	if(_.isUndefined(dev)) {
		log("DEVELOPMENT must be defined in environment. Exiting.", "checkEnv", LogSeverity.ERROR);
		return false;
	}

	if(_.isNaN(dev)) {
		log("DEVELOPMENT must be number (0 or 1). Exiting.", "checkEnv", LogSeverity.ERROR);
		return false;
	}

	if(dev < 0 || dev > 1) {
		log("DEVELOPMENT must be 0 or 1. Exiting.", "checkEnv", LogSeverity.ERROR);
		return false;
	}

	if(dev === 1) {
		log("Running in development mode.", "checkEnv", LogSeverity.WARN);
	}

	log("Environment variable checks completed.", "checkEnv", LogSeverity.LOG);
	return true;
}

if(!checkEnv()) {
	process.exit();
}

app.listen(PORT, () => {
	log(`Server is running at port ${ PORT }`, "checkEnv", LogSeverity.LOG);
});
