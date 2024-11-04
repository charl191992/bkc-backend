import { body } from "express-validator.js";

const createInterviewRules = [
  body("application")
    .trim()
    .isEmpty()
    .withMessage("Application Id is required")
    .isMongoId()
    .withMessage("Invalid application id"),
  body("date").trim().isEmpty().withMessage(),
  body("start_time"),
  body("end_time"),
];

export default createInterviewRules;
