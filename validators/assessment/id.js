import { param } from "express-validator";
import Assessment from "../../smscr/assessments/assessment.schema.js";

const assessmentIdRules = [
  param("id")
    .trim()
    .notEmpty()
    .withMessage("Assessment id is required.")
    .isMongoId()
    .withMessage("Invalid assessment id.")
    .custom(async (value, { req }) => {
      const assessment = await Assessment.findOne({ _id: value });
      if (!assessment) throw new Error("Assessment not found");
      req.assessment = assessment;
      return true;
    }),
];

export default assessmentIdRules;
