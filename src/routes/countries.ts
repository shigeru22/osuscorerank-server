import { Router } from "express";
import { getAllCountries, getCountry, addCountry, deleteCountry } from "../controllers/countries";
import { verifyProjectKey } from "../middleware/deta";
import { verifyToken } from "../middleware/auth";

const router = Router();

router.get("/", verifyProjectKey, getAllCountries);
router.get("/:countryId", verifyProjectKey, getCountry);

router.post("/add", [ verifyToken, verifyProjectKey ], addCountry);

router.delete("/delete", [ verifyToken, verifyProjectKey ], deleteCountry);

export default router;
