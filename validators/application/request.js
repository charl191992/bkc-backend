import { body } from "express-validator";
import { urlPattern } from "../../utils/pattern.js";

const requestApplicationRules = [
  body("email")
    .trim()
    .exists({ checkFalsy: true })
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address"),

  body("country")
    .trim()
    .exists({ checkFalsy: true })
    .withMessage("Country is required"),

  body("firstname")
    .trim()
    .exists({ checkFalsy: true })
    .withMessage("Firstname is required"),

  body("middlename")
    .optional()
    .trim()
    .isString()
    .withMessage("Middlename must be a string"),

  body("lastname")
    .trim()
    .exists({ checkFalsy: true })
    .withMessage("Lastname is required"),

  body("extname")
    .optional()
    .trim()
    .isString()
    .withMessage("Extname must be a string"),

  body("subjects")
    .exists()
    .withMessage("Select at least 1 subject")
    .isArray({ min: 1 })
    .withMessage("Select at least 1 subject"),

  body("days")
    .exists()
    .withMessage("Select at least 1 day")
    .isArray({ min: 1 })
    .withMessage("Select at least 1 day"),

  body("session_per_day")
    .isInt({ min: 1 })
    .withMessage("Session per day must be at least 1"),

  body("hours_per_session")
    .isInt({ min: 1 })
    .withMessage("Hours per session must be at least 1"),

  body("stable_internet")
    .trim()
    .exists({ checkFalsy: true })
    .withMessage("Please answer this question")
    .isIn(["true", "false"])
    .withMessage("Please select only one of the provided choices")
    .customSanitizer(value => value === "true"),

  body("noise_cancelling_headphones")
    .trim()
    .exists({ checkFalsy: true })
    .withMessage("Please answer this question")
    .isIn(["true", "false"])
    .withMessage("Please select only one of the provided choices")
    .customSanitizer(value => value === "true"),

  body("has_microphone")
    .trim()
    .exists({ checkFalsy: true })
    .withMessage("Please answer this question")
    .isIn(["true", "false"])
    .withMessage("Please select only one of the provided choices")
    .customSanitizer(value => value === "true"),

  body("cv_link")
    .trim()
    .exists({ checkFalsy: true })
    .withMessage("CV link is required")
    .matches(urlPattern)
    .withMessage("Please provide a valid URL/Link"),

  body("introduction_link")
    .trim()
    .exists({ checkFalsy: true })
    .withMessage("Introduction video link is required")
    .matches(urlPattern)
    .withMessage("Please provide a valid URL/Link"),
];

export default requestApplicationRules;
