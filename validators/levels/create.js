import { body } from "express-validator";
import { stringEscape } from "../../utils/escape-string.js";
import EducationLevel from "../../smscr/education-levels/education-level.schema.js";

const createLevelRules = [
  body("level")
    .trim()
    .notEmpty()
    .withMessage("Level is required")
    .custom(async value => {
      const level = stringEscape(value);
      const regex = new RegExp(`^${level}$`, "i");
      const exists = await EducationLevel.exists({
        label: { $regex: regex },
      });
      if (exists) {
        throw new Error("Level already exists");
      }
      return true;
    }),
];

export default createLevelRules;
