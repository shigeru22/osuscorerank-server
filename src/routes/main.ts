import { Router } from "express";
import { getGreeting, addDummyData } from "../controllers/main";
import { verifyProjectKey } from "../middleware/deta";

const router = Router();

router.get("/", getGreeting);
router.post("/dummy", verifyProjectKey, addDummyData);

export default router;
