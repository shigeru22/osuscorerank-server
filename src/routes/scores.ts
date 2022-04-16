import { Router } from "express";
import * as scores from "../controllers/scores";
import { verifyProjectKey } from "../middleware/deta";

const router = Router();

router.get("/", verifyProjectKey, scores.getAllScores);
router.get("/country/:countryId", verifyProjectKey, scores.getCountryScores);
router.get("/user/:userId", verifyProjectKey, scores.getUserScore);
router.get("/users", verifyProjectKey, scores.getMultipleUserScores);

router.post("/add", verifyProjectKey, scores.addScore);

router.delete("/delete", verifyProjectKey, scores.deleteScore);

export default router;
