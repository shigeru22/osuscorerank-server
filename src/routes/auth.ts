import { Router } from "express";
import * as auth from "../controllers/auth";
import { verifyToken } from "../middleware/auth";

const router = Router();

router.post("/", auth.getAccessToken);
router.post("/test", verifyToken);

export default router;
