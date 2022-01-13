import { Router } from "express";
import * as main from "../controllers/main";

const router = Router();

router.get("/", main.getGreeting);

export default router;
