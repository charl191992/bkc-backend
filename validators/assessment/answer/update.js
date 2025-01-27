import { body, param } from "express-validator";
import AssessmentAnswer from "../../../smscr/assessments/answers/assessment.answer.schema.js";

const updateAssessmentAnswerRules = [
  param("id")
    .trim()
    .notEmpty()
    .withMessage("Assessment answer id is required")
    .isMongoId()
    .withMessage("Invalid assessment answer id")
    .custom(async (value, { req }) => {
      const answer = await AssessmentAnswer.exists({
        _id: value,
      });
      if (!answer) throw Error("Assessment answer not found");
      return true;
    }),
  body("answer")
    .trim()
    .notEmpty()
    .withMessage("Answer is required")
    .isLength({ min: 1, max: 255 })
    .withMessage("Answer must be between 1 to 255 characters long."),
];

export default updateAssessmentAnswerRules;
