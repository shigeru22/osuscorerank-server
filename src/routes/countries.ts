import { Router } from "express";
import * as countries from "../controllers/countries";
import { verifyProjectKey } from "../middleware/deta";
import { verifyToken } from "../middleware/auth";

const router = Router();

router.get("/", verifyProjectKey, countries.getAllCountries);
router.get("/:countryId", verifyProjectKey, countries.getCountry);

router.post("/add", [ verifyProjectKey, verifyToken ], countries.addCountry);

router.delete("/delete", [ verifyProjectKey, verifyToken ], countries.deleteCountry);

export default router;
