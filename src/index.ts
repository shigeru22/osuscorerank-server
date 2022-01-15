import express from "express";
import env from "dotenv";
import mainRoute from "./routes/main";
import scoreRoute from "./routes/scores";
import countryRoute from "./routes/countries";

env.config();

const app = express();
const PORT = process.env.API_PORT || 5000;

/* middlewares */
app.use(express.json());

/* routes */
app.use("/", mainRoute);
app.use("/scores", scoreRoute);
app.use("/countries", countryRoute);

app.listen(PORT, () => {
	console.log(`[INFO] Server is running at port ${ PORT }`);
});
