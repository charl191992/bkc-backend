import { param } from "express-validator";
import AssessmentSection from "../../../smscr/assessments/sections/assessment.section.schema.js";

const assessmentSectionIdRules = [
  param("id")
    .trim()
    .notEmpty()
    .withMessage("Assessment section id is required.")
    .isMongoId()
    .withMessage("Invalid assessment section id.")
    .custom(async value => {
      const section = await AssessmentSection.exists({ _id: value });
      if (!section) throw new Error("Assessment section not found");
      return true;
    }),
];

export default assessmentSectionIdRules;
