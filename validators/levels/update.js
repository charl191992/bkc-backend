import { body, param } from "express-validator";
import EducationLevel from "../../smscr/education-levels/education-level.schema.js";
import { stringEscape } from "../../utils/escape-string.js";

const updateLevelRules = [
  param("id")
    .trim()
    .notEmpty()
    .withMessage("Level ID is required")
    .isMongoId()
    .withMessage("Invalid level id.")
    .custom(async value => {
      const level = await EducationLevel.exists({ _id: value });
      if (!level) throw new Error("Level not found");
      return true;
    }),
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

export default updateLevelRules;
