import { body, param } from "express-validator";
import Country from "../../smscr/countries/country.schema.js";
import { stringEscape } from "../../utils/escape-string.js";
import { DateTime } from "luxon";

const updateCountryRules = [
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
  body("country")
    .trim()
    .notEmpty()
    .withMessage("Country is required")
    .custom(async value => {
      const country = stringEscape(value);
      const regex = new RegExp(`^${country}$`, "i");
      const exists = await Country.exists({
        label: { $regex: regex },
      });
      if (exists) {
        throw new Error("Country already exists");
      }
      return true;
    }),
  body("timezone")
    .trim()
    .notEmpty()
    .withMessage("Timezone is required")
    .custom(value => {
      try {
        const timezone = value.trim();
        const dt = DateTime.now().setZone(timezone);
        if (!dt.isValid) throw new Error("Invalid IANA Timezone");
        return true;
      } catch (error) {
        console.log(error);
        throw new Error("Invalid IANA Timezone");
      }
    }),
];

export default updateCountryRules;
