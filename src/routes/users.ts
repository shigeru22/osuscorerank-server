import { Router } from "express";
import { getAllUsers, getUser, addUser, deleteUser, updateUser, getCountryUsers } from "../controllers/users";
import { verifyProjectKey } from "../middleware/deta";
import { verifyToken } from "../middleware/auth";

const router = Router();

router.get("/", verifyProjectKey, getAllUsers);
router.get("/country/:countryId", verifyProjectKey, getCountryUsers);
router.get("/:userId", verifyProjectKey, getUser);

router.post("/add", [ verifyToken, verifyProjectKey ], addUser);

router.put("/update", [ verifyToken, verifyProjectKey ], updateUser);

router.delete("/delete", [ verifyToken, verifyProjectKey ], deleteUser);

export default router;
