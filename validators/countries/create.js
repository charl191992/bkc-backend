import { body } from "express-validator";
import { DateTime } from "luxon";
import { stringEscape } from "../../utils/escape-string.js";
import Country from "../../smscr/countries/country.schema.js";

const createCountryRules = [
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
        if (!dt.isValid) throw new Error("Invalid IANA Timezone string");
        return true;
      } catch (error) {
        throw new Error("Invalid IANA Timezone string");
      }
    }),
];

export default createCountryRules;
