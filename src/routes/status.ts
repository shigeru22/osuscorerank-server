import { Router } from "express";
import { getStatus } from "../controllers/status";
import { verifyProjectKey } from "../middleware/deta";
import { verifyToken } from "../middleware/auth";

const router = Router();

router.get("/", [ verifyToken, verifyProjectKey ], getStatus);

export default router;
