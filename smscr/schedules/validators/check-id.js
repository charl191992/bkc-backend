import { param } from "express-validator";

const checkIdScheduleRules = [
  param("id")
    .trim()
    .notEmpty()
    .withMessage("Schedule ID is required")
    .isMongoId()
    .withMessage("Invalid schedule id"),
];

export default checkIdScheduleRules;
