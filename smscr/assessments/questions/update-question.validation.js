import { body, param } from "express-validator";
import Assessment from "../assessment.schema.js";
import AssessmentSection from "../sections/assessment.section.schema.js";
import { validateHTMLContent } from "../../../utils/sanitize-html.js";
import AssessmentQuestion from "./assessment.question.schema.js";

const updateQuestionRules = [
  param("id")
    .trim()
    .notEmpty()
    .withMessage("Assessment question id is required")
    .isMongoId()
    .withMessage("Invalid Assessment question id")
    .custom(async value => {
      const exists = await AssessmentQuestion.exists({ _id: value });
      if (!exists) {
        throw new Error("Assessment question does not exists");
      }
      return true;
    }),
  body("assessmentId")
    .trim()
    .notEmpty()
    .withMessage("Assessment id is required")
    .isMongoId()
    .withMessage("Invalid Assessment id")
    .custom(async value => {
      const exists = await Assessment.exists({ _id: value });
      if (!exists) {
        throw new Error("Assessment does not exists");
      }
      return true;
    }),
  body("sectionId")
    .trim()
    .notEmpty()
    .withMessage("Assessment section id is required")
    .isMongoId()
    .withMessage("Invalid Assessment section id")
    .custom(async (value, { req }) => {
      const exists = await AssessmentSection.exists({
        _id: value,
        assessment: req.body.assessmentId,
      });
      if (!exists) {
        throw new Error("Assessment section does not exists");
      }
      return true;
    }),
  body("textQuestion")
    .if(body("textQuestion").exists())
    .trim()
    .notEmpty()
    .withMessage("Text question cannot be empty")
    .custom(value => {
      const result = validateHTMLContent(value, 500);

      if (result.length < 1) {
        throw new Error("Text question cannot be empty");
      }

      if (!result.isValid) {
        throw new Error(
          "Text question must only consist of 1 - 500 characters"
        );
      }
      return true;
    }),
  body("removeOldImage").isBoolean().withMessage("Invalid old image removable"),
];

export default updateQuestionRules;
