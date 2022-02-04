import { Router } from "express";
import * as updates from "../controllers/updates";

const router = Router();

router.get("/", updates.getLatestUpdates);

export default router;
