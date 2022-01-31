import { Router } from "express";
import * as users from "../controllers/users";
import { verifyToken } from "../middleware/auth";

const router = Router();

router.get("/", users.getAllUsers);
router.get("/:userId", users.getUser);

router.post("/add", verifyToken, users.addUser);

router.delete("/delete", verifyToken, users.deleteUser);

export default router;
