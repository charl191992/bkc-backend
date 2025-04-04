import { body } from "express-validator";
import Assessment from "../../../smscr/assessments/assessment.schema.js";
import { validateHTMLContent } from "../../../utils/sanitize-html.js";

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
    .custom(value => {
      if (!validateHTMLContent(value, 500).isValid) {
        throw new Error("Instruction must only consist of 1 - 500 characters");
      }
      return true;
    }),
];

export default createAssessmentSectionRules;
