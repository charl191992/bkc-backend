import { param } from "express-validator";
import Level from "../../smscr/levels/level.schema.js";

const checkLevelIdRules = [
  param("id")
    .trim()
    .notEmpty()
    .withMessage("Level ID is required")
    .isMongoId()
    .withMessage("Invalid level id.")
    .custom(async value => {
      const level = await Level.exists({ _id: value });
      if (!level) throw new Error("Level not found");
      return true;
    }),
];

export default checkLevelIdRules;
