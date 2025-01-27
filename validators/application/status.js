import { body, param } from "express-validator";
import Application from "../../smscr/applications/application.schema.js";

const changeApplicationStatusRules = [
  param("id")
    .trim()
    .notEmpty()
    .withMessage("Application id is required")
    .isMongoId()
    .withMessage("Invalid application id")
    .custom(async value => {
      const application = await Application.exists({ _id: value });
      if (!application) throw new Error("Application not found");
      return true;
    }),
];

export default changeApplicationStatusRules;
