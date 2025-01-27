import express from "express";
import * as CountryController from "./country.controller.js";
import isAuthorized from "../../middlewares/authorized.js";
import { suAdmin } from "../../utils/roles.js";
import verifyToken from "../../middlewares/token-verification.js";
import validateData from "../../validators/validate-data.js";
import createCountryRules from "../../validators/countries/create.js";
import updateCountryRules from "../../validators/countries/update.js";
import checkCountryIdRules from "../../validators/countries/delete.js";

const countryRoutes = express.Router();

countryRoutes
  .post(
    "/",
    verifyToken,
    isAuthorized([suAdmin]),
    createCountryRules,
    validateData,
    CountryController.createCountry
  )
  .put(
    "/:id",
    verifyToken,
    isAuthorized([suAdmin]),
    updateCountryRules,
    validateData,
    CountryController.updateCountry
  )
  .get(
    "/",
    verifyToken,
    isAuthorized([suAdmin]),
    CountryController.getCountries
  )
  .delete(
    "/:id",
    verifyToken,
    isAuthorized([suAdmin]),
    checkCountryIdRules,
    validateData,
    CountryController.deleteCountry
  );

export default countryRoutes;
