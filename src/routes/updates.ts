import { Router } from "express";
import { getAllUpdates, getLatestUpdate, getUpdate, addUpdateData } from "../controllers/updates";
import { verifyProjectKey } from "../middleware/deta";
import { verifyToken } from "../middleware/auth";

const router = Router();

router.get("/", verifyProjectKey, getLatestUpdate);
router.get("/all", verifyProjectKey, getAllUpdates);
router.get("/:updateId", verifyProjectKey, getUpdate);

router.post("/add", [ verifyToken, verifyProjectKey ], addUpdateData);

export default router;
