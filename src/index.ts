import path from "path";
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
const PORT = process.env.API_PORT || 3000;
const clientPath = path.join(__dirname + "/client/index.html");

/* middlewares */
app.use(express.json());
app.use(cors());

/* static files */
app.use(express.static(path.resolve(__dirname, "./client")));

/* routes */
app.use("/api/", mainRoute);
app.use("/api/countries", countryRoute);
app.use("/api/users", userRoute);
app.use("/api/scores", scoreRoute);
app.use("/api/updates", updateRoute);
app.use("/api/auth", authRoute);
app.use("/api/status", statusRoute);

app.use("/api/*", getNotFoundMessage);

app.get("*", (req, res) => {
	if(!_.isUndefined(process.env.DEVELOPMENT) && process.env.DEVELOPMENT === "1") {
		res.send("If you're seeing this message, the server is running in development mode. Client endpoints are only available in production mode.");
		return;
	}

	res.sendFile(clientPath);
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

if(!_.isUndefined(process.env.STANDALONE) && process.env.STANDALONE === "1") {
	if(!checkEnv()) {
		process.exit();
	}

	app.listen(PORT, () => {
		log(`Server is running at port ${ PORT }`, "checkEnv", LogSeverity.LOG);
	});
}

export default app;
