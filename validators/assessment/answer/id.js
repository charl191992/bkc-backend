import { param } from "express-validator";
import AssessmentAnswer from "../../../smscr/assessments/answers/assessment.answer.schema.js";

const assessmentAnswerIdRules = [
  param("id")
    .trim()
    .notEmpty()
    .withMessage("Assessment answer id is required")
    .isMongoId()
    .withMessage("Invalid assessment answer id")
    .custom(async value => {
      const answer = await AssessmentAnswer.exists({
        _id: value,
      });
      if (!answer) throw Error("Assessment answer not found");
      return true;
    }),
];

export default assessmentAnswerIdRules;
