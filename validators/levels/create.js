import { body } from "express-validator";
import { stringEscape } from "../../utils/escape-string.js";
import Level from "../../smscr/levels/level.schema.js";

const createLevelRules = [
  body("level")
    .trim()
    .notEmpty()
    .withMessage("Level is required")
    .custom(async value => {
      const level = stringEscape(value);
      const regex = new RegExp(`^${level}$`, "i");
      const exists = await Level.exists({
        label: { $regex: regex },
      });
      if (exists) {
        throw new Error("Level already exists");
      }
      return true;
    }),
];

export default createLevelRules;
