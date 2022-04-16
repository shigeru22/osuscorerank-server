import { Router } from "express";
import * as scores from "../controllers/scores";
import { verifyProjectKey } from "../middleware/deta";
import { verifyToken } from "../middleware/auth";

const router = Router();

router.get("/", verifyProjectKey, scores.getAllScores);
router.get("/country/:countryId", verifyProjectKey, scores.getCountryScores);
router.get("/user/:userId", verifyProjectKey, scores.getUserScore);
router.get("/users", verifyProjectKey, scores.getMultipleUserScores);

router.post("/add", [ verifyProjectKey, verifyToken ], scores.addScore);

router.delete("/delete", [ verifyProjectKey, verifyToken ], scores.deleteScore);

export default router;
