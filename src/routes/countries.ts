import { Router } from "express";
import * as countries from "../controllers/countries";
import { verifyProjectKey } from "../middleware/deta";
import { verifyToken } from "../middleware/auth";

const router = Router();

router.get("/", verifyProjectKey, countries.getAllCountries);
router.get("/:countryId", verifyProjectKey, countries.getCountry);

router.post("/add", [ verifyToken, verifyProjectKey ], countries.addCountry);

router.delete("/delete", [ verifyToken, verifyProjectKey ], countries.deleteCountry);

export default router;
