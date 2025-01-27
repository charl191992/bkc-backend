import { body } from "express-validator";
import Assessment from "../../../smscr/assessments/assessment.schema.js";
import AssessmentSection from "../../../smscr/assessments/sections/assessment.section.schema.js";

const createAssessmentAnswerRules = [
  body("assessment")
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
  body("assessment_section")
    .trim()
    .notEmpty()
    .withMessage("Assessment section id is required")
    .isMongoId()
    .withMessage("Invalid assessment section id")
    .custom(async (value, { req }) => {
      const section = await AssessmentSection.exists({
        _id: value,
        assessment: req.body.assessment,
      });
      if (!section) throw new Error("Assessment section not found");

      return true;
    }),
  body("answer")
    .trim()
    .notEmpty()
    .withMessage("Answer is required")
    .isLength({ min: 1, max: 255 })
    .withMessage("Answer must be between 1 to 255 characters long."),
];

export default createAssessmentAnswerRules;
