import { body, param } from "express-validator";
import Country from "../../smscr/countries/country.schema.js";
import Subject from "../../smscr/subjects/subject.schema.js";
import Level from "../../smscr/levels/level.schema.js";
import Assessment from "../../smscr/assessments/assessment.schema.js";

const updateAssessmentRules = [
  param("id")
    .trim()
    .notEmpty()
    .withMessage("Assessment id is required.")
    .isMongoId()
    .withMessage("Invalid assessment id.")
    .custom(async value => {
      const assessment = await Assessment.exists({ _id: value });
      if (!assessment) throw new Error("Assessment not found");
      return true;
    }),
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
  body("country")
    .trim()
    .notEmpty()
    .withMessage("Country is required")
    .isMongoId()
    .withMessage("Invalid country id")
    .custom(async value => {
      const country = await Country.exists({ _id: value });
      if (!country) throw new Error("Country not found");
      return true;
    }),
  body("level")
    .trim()
    .notEmpty()
    .withMessage("Grade Level is required")
    .isMongoId()
    .withMessage("Invalid grade level id")
    .custom(async value => {
      const level = await Level.exists({ _id: value });
      if (!level) throw new Error("Grade Level not found");
      return true;
    }),
];

export default updateAssessmentRules;
