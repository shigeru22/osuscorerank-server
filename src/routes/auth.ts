import { Router } from "express";
import { getAccessToken } from "../controllers/auth";
import { verifyProjectKey } from "../middleware/deta";

const router = Router();

router.post("/", verifyProjectKey, getAccessToken);

export default router;
