import { body, param } from "express-validator";
import AssessmentSection from "../../../smscr/assessments/sections/assessment.section.schema.js";
import Assessment from "../../../smscr/assessments/assessment.schema.js";
import toObjID from "../../../utils/object-id.js";

const updateAssessmentSectionRules = [
  param("id")
    .trim()
    .notEmpty()
    .withMessage("Assessment section id is required.")
    .isMongoId()
    .withMessage("Invalid assessment section id.")
    .custom(async (value, { req }) => {
      const section = await AssessmentSection.findOne({ _id: value }).exec();
      if (!section) throw new Error("Assessment section not found");
      if (section.assessment === toObjID(req.body.assessment_id))
        throw Error("Invalid assessment section id");

      return true;
    }),
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

export default updateAssessmentSectionRules;
