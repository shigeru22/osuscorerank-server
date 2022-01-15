import { Router } from "express";
import * as countries from "../controllers/countries";

const router = Router();

router.get("/", countries.getAllCountries);
router.get("/:countryId", countries.getCountry);

export default router;
