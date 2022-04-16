import { Router } from "express";
import * as users from "../controllers/users";
import { verifyProjectKey } from "../middleware/deta";
import { verifyToken } from "../middleware/auth";

const router = Router();

router.get("/", verifyProjectKey, users.getAllUsers);
router.get("/:userId", verifyProjectKey, users.getUser);

router.post("/add", [ verifyToken, verifyProjectKey ], users.addUser);

router.delete("/delete", [ verifyToken, verifyProjectKey ], users.deleteUser);

export default router;
