import { body } from "express-validator";
import Assessment from "../../../smscr/assessments/assessment.schema.js";

const createAssessmentSectionRules = [
  body("assessment_id")
    .trim()
    .notEmpty()
    .withMessage("Assessment id is required")
    .isMongoId()
    .withMessage("Invalid assessment id")
    .custom(async value => {
      const assessment = await Assessment.exists({ _id: value });
      if (!assessment) throw new Error("Assessment not found");
      return true;
    }),
  body("instruction")
    .trim()
    .notEmpty()
    .withMessage("Instruction is required")
    .isLength({ min: 1, max: 255 })
    .withMessage("Instruction must be between 1 to 255 characters long."),
];

export default createAssessmentSectionRules;
