import { body } from "express-validator";
import StudentAssessment from "./student-assessment.schema.js";

export const submitAssessmentRules = [
  body("id")
    .trim()
    .notEmpty()
    .withMessage("Assessment id is required")
    .isMongoId()
    .withMessage("Invalid assessment id")
    .custom(async value => {
      const exists = await StudentAssessment.exists({ _id: value, taken: false, "sections.questions.studentAnswer": { $ne: null } });
      if (!exists) throw new Error("Please answer all questions.");
      return true;
    }),
];

export const takeAssessmentRules = [
  body("id")
    .trim()
    .notEmpty()
    .withMessage("Assessment id is required")
    .isMongoId()
    .withMessage("Invalid assessment id")
    .custom(async value => {
      const exists = await StudentAssessment.exists({ _id: value, taken: false });
      if (!exists) throw new Error("Assessment is either not found or already taken.");
      return true;
    }),
  body("code").trim().notEmpty().withMessage("Code is required").isLength({ min: 6, max: 6 }).withMessage("Invalid code").isNumeric().withMessage("Invalid code"),
];

export const setAnswerRules = [
  body("section").trim().notEmpty().withMessage("Section id is required").isMongoId().withMessage("Invalid section id"),
  body("question").trim().notEmpty().withMessage("Question id is required").isMongoId().withMessage("Invalid question id"),
  body("assessment")
    .trim()
    .notEmpty()
    .withMessage("Assessment id is required")
    .isMongoId()
    .withMessage("Invalid assessment id")
    .custom(async (value, { req }) => {
      const { section, question } = req.body;
      const exists = await StudentAssessment.exists({ _id: value, "sections._id": section, "sections.questions._id": question, taken: false });
      if (!exists) throw new Error("Assessment is either not found or already taken.");
      return true;
    }),
  body("answer").trim().notEmpty().withMessage("Answer is required").isLength({}),
];
