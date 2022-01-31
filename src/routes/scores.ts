import { Router } from "express";
import * as scores from "../controllers/scores";
import { verifyToken } from "../middleware/auth";

const router = Router();

router.get("/", scores.getAllScores);
router.get("/country/:countryId", scores.getCountryScores);
router.get("/user/:userId", scores.getUserScore);

router.post("/add", verifyToken, scores.addUserScore);

router.delete("/delete", verifyToken, scores.deleteUserScore);
router.delete("/deleteall", verifyToken, scores.resetScores);

export default router;
