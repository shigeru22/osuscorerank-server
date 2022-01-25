import { Router } from "express";
import * as countries from "../controllers/countries";

const router = Router();

router.get("/", countries.getAllCountries);
router.get("/:countryId", countries.getCountry);

router.post("/add", countries.addCountry);

router.delete("/delete", countries.deleteCountry);
router.delete("/deleteall", countries.resetCountries);

export default router;
