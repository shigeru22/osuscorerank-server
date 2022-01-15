import { Router } from "express";
import * as scores from "../controllers/scores";

const router = Router();

router.get("/", scores.getAllScores);
router.get("/country/:countryId", scores.getScoresByCountry);
router.get("/user/:userId", scores.getScoreByUser);

router.post("/add", scores.addUserScore);

router.delete("/delete", scores.deleteUserScore);
router.delete("/deleteall", scores.resetScores);

export default router;
