import { Router } from "express";
import { getAllScores, getCountryScores, getUserScore, getMultipleUserScores, addScore, deleteScore } from "../controllers/scores";
import { verifyProjectKey } from "../middleware/deta";
import { verifyToken } from "../middleware/auth";

const router = Router();

router.get("/", verifyProjectKey, getAllScores);
router.get("/country/:countryId", verifyProjectKey, getCountryScores);
router.get("/user/:userId", verifyProjectKey, getUserScore);
router.get("/users", verifyProjectKey, getMultipleUserScores);

router.post("/add", [ verifyToken, verifyProjectKey ], addScore);

router.delete("/delete", [ verifyToken, verifyProjectKey ], deleteScore);

export default router;
