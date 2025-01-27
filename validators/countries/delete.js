import { param } from "express-validator";
import Country from "../../smscr/countries/country.schema.js";

const checkCountryIdRules = [
  param("id")
    .trim()
    .notEmpty()
    .withMessage("Country ID is required")
    .isMongoId()
    .withMessage("Invalid country id.")
    .custom(async value => {
      const country = await Country.exists({ _id: value });
      if (!country) throw new Error("Country not found");
      return true;
    }),
];

export default checkCountryIdRules;
