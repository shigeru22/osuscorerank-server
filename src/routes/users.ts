import { Router } from "express";
import * as users from "../controllers/users";

const router = Router();

router.get("/", users.getAllUsers);
router.get("/:userId", users.getUser);

router.post("/add", users.addUser);

router.delete("/delete", users.deleteUser);

export default router;
