import { body, param } from "express-validator";
import Assessment from "../../smscr/assessments/assessment.schema.js";

const assessmentStatusRules = [
  param("id")
    .trim()
    .notEmpty()
    .withMessage("Assessment id is required")
    .isMongoId()
    .withMessage("Invalid assessment id")
    .custom(async value => {
      const assessment = await Assessment.exists({ _id: value });
      if (!assessment) throw Error("Assessment not found");
      return true;
    }),
  body("status")
    .trim()
    .notEmpty()
    .withMessage("Assessment status is required.")
    .custom(async value => {
      const statuses = ["draft", "completed"];
      if (!statuses.includes(value))
        throw new Error("Invalid assessment status");
      return true;
    }),
];

export default assessmentStatusRules;
