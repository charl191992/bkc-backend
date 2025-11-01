import { body } from "express-validator";

import Enrollment from "../enrollments/enrollment.schema.js";
import { validateHTMLContent } from "../../utils/sanitize-html.js";

const validDays = ["monday", "tuesday", "wednesday", "thursday", "friday"];

export const recommendationRules = [
  body("enrollment")
    .trim()
    .notEmpty()
    .withMessage("Enrollment id is required")
    .isMongoId()
    .withMessage("Invalid enrollment id")
    .custom(async value => {
      const enrollment = await Enrollment.exists({ _id: value, recommendation: null });
      if (!enrollment) throw new Error("Enrollment not found");
      return true;
    }),
  body("recommendation")
    .trim()
    .notEmpty()
    .withMessage("Recommendation is required")
    .custom(value => {
      const result = validateHTMLContent(value, 5000);

      if (result.length < 1) {
        throw new Error("Recommendation cannot be empty");
      }

      if (!result.isValid) {
        throw new Error("Recommendaiton must only consist of 1 - 5000 characters");
      }
      return true;
    }),
  body("days")
    .isArray({ min: 1, max: 5 })
    .withMessage("Days must be an array with 1 - 5 items")
    .custom(value => {
      if (!Array.isArray(value)) throw Error("Days must be an array");

      const invalidDays = value.filter(day => !validDays.includes(day));
      if (invalidDays.length > 0) {
        throw new Error(`Invalid days found: ${invalidDays.join(", ")}. Valid days are: ${validDays.join(", ")}`);
      }

      const uniqueDays = [...new Set(value)];
      if (uniqueDays.length !== value.length) {
        throw new Error("Duplicate days are not allowed");
      }

      return true;
    }),
];
