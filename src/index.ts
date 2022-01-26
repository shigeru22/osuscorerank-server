import express from "express";
import env from "dotenv";
import mainRoute from "./routes/main";
import scoreRoute from "./routes/scores";
import userRoute from "./routes/users";
import countryRoute from "./routes/countries";
import { LogLevel, log } from "./utils/log";

env.config();

const app = express();
const PORT = process.env.API_PORT || 5000;

/* middlewares */
app.use(express.json());

/* routes */
app.use("/", mainRoute);
app.use("/scores", scoreRoute);
app.use("/users", userRoute);
app.use("/countries", countryRoute);

app.listen(PORT, () => {
	log(`Server is running at port ${ PORT }`, LogLevel.LOG);
});
