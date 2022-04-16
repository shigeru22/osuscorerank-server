import { Router } from "express";
import * as users from "../controllers/users";
import { verifyProjectKey } from "../middleware/deta";

const router = Router();

router.get("/", verifyProjectKey, users.getAllUsers);
router.get("/:userId", verifyProjectKey, users.getUser);

router.post("/add", verifyProjectKey, users.addUser);

router.delete("/delete", verifyProjectKey, users.deleteUser);

export default router;
