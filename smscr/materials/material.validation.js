import { param, query } from "express-validator";
import Material from "./material.schema.js";

export const materialIdRules = [
  param("id")
    .trim()
    .notEmpty()
    .withMessage("Material id is required")
    .isMongoId()
    .withMessage("Invalid material id")
    .custom(async value => {
      const exists = await Material.exists({ _id: value }).exec();
      if (!exists) throw Error("Material not found");
      return true;
    }),
];
