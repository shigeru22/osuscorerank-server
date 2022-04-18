import { Router } from "express";
import { getAllUpdates, getLatestUpdate, getUpdate, addUpdateData, updateDataOnlineStatus } from "../controllers/updates";
import { verifyProjectKey } from "../middleware/deta";
import { verifyToken } from "../middleware/auth";

const router = Router();

router.get("/", verifyProjectKey, getLatestUpdate);
router.get("/all", verifyProjectKey, getAllUpdates);
router.get("/:updateId", verifyProjectKey, getUpdate);

router.post("/add", [ verifyToken, verifyProjectKey ], addUpdateData);
router.put("/setonline", [ verifyToken, verifyProjectKey ], updateDataOnlineStatus);

export default router;
