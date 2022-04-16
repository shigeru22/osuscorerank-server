import { Router } from "express";
import * as main from "../controllers/main";
import { verifyProjectKey } from "../middleware/deta";

const router = Router();

router.get("/", main.getGreeting);
router.post("/dummy", verifyProjectKey, main.addDummyData);

export default router;
