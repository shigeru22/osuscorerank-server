import { Router } from "express";
import * as countries from "../controllers/countries";
import { verifyProjectKey } from "../middleware/deta";

const router = Router();

router.get("/", verifyProjectKey, countries.getAllCountries);
router.get("/:countryId", verifyProjectKey, countries.getCountry);

router.post("/add", verifyProjectKey, countries.addCountry);

router.delete("/delete", verifyProjectKey, countries.deleteCountry);

export default router;
