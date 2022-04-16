import { Router } from "express";
import * as auth from "../controllers/auth";
import { verifyProjectKey } from "../middleware/deta";

const router = Router();

router.post("/", verifyProjectKey, auth.getAccessToken);

export default router;
