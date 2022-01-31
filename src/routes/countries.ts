import { Router } from "express";
import * as countries from "../controllers/countries";
import { verifyToken } from "../middleware/auth";

const router = Router();

router.get("/", countries.getAllCountries);
router.get("/:countryId", countries.getCountry);

router.post("/add", verifyToken, countries.addCountry);

router.delete("/delete", verifyToken, countries.deleteCountry);
router.delete("/deleteall", verifyToken, countries.resetCountries);

export default router;
