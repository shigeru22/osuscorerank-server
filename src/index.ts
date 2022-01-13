import express from "express";
import env from "dotenv";
import mainRoute from "./routes/main";

env.config();

const app = express();
const PORT = process.env.API_PORT || 5000;

app.use(express.json());

app.use("/", mainRoute);

app.listen(PORT, () => {
	console.log(`[INFO] Server is running at port ${ PORT }`);
});
