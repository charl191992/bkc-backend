import { body } from "express-validator";
import Subject from "../../smscr/subjects/subject.schema.js";
import EducationLevel from "../../smscr/education-levels/education-level.schema.js";
import Assessment from "../../smscr/assessments/assessment.schema.js";

const createAssessmentRules = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 1, max: 255 })
    .withMessage("Title must be between 1 to 255 characters long."),
  body("subject")
    .trim()
    .notEmpty()
    .withMessage("Subject is required")
    .isMongoId()
    .withMessage("Invalid subject id")
    .custom(async value => {
      const subject = await Subject.exists({ _id: value });
      if (!subject) throw new Error("Subject not found");
      return true;
    }),
  body("country").trim().notEmpty().withMessage("Country is required"),
  body("type")
    .trim()
    .notEmpty()
    .withMessage("Assessment Type is required")
    .custom(value => {
      if (!Assessment.schema.path("type").enumValues.includes(value)) {
        throw new Error("Invalid assessment type");
      }
      return true;
    }),
  body("level")
    .trim()
    .notEmpty()
    .withMessage("Education/Grade Level is required")
    .isMongoId()
    .withMessage("Invalid education/grade level id")
    .custom(async value => {
      const level = await EducationLevel.exists({ _id: value });
      if (!level) throw new Error("Grade Level not found");
      return true;
    }),
];

export default createAssessmentRules;
