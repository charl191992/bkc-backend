import { body } from "express-validator";
import { validateHTMLContent } from "../../../utils/sanitize-html.js";
import AssessmentQuestion from "./assessment.question.schema.js";

const addChoiceRules = [
  body("assessmentId")
    .trim()
    .notEmpty()
    .withMessage("Assessment id is required")
    .isMongoId()
    .withMessage("Invalid Assessment id"),
  body("sectionId")
    .trim()
    .notEmpty()
    .withMessage("Assessment section id is required")
    .isMongoId()
    .withMessage("Invalid Assessment section id"),
  body("questionId")
    .trim()
    .notEmpty()
    .withMessage("Assessment question id is required")
    .isMongoId()
    .withMessage("Invalid Assessment section id")
    .custom(async (value, { req }) => {
      const exists = await AssessmentQuestion.exists({
        _id: value,
        assessment: req.body.assessmentId,
        section: req.body.sectionId,
      });
      if (!exists) {
        throw new Error("Assessment question does not exists");
      }
      return true;
    }),
  body("textChoice")
    .if(body("textChoice").exists())
    .trim()
    .notEmpty()
    .withMessage("Text choice cannot be empty")
    .custom(value => {
      const result = validateHTMLContent(value, 500);

      if (result.length < 1) {
        throw new Error("Text choice cannot be empty");
      }

      if (!result.isValid) {
        throw new Error("Text choice must only consist of 1 - 500 characters");
      }
      return true;
    }),
];

export default addChoiceRules;
