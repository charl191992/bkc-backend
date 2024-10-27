import { body } from "express-validator";

const loginRules = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email address is required")
    .isEmail()
    .withMessage("Invalid email address"),
  body("password").trim().notEmpty().withMessage("Password is required"),
];

export default loginRules;
