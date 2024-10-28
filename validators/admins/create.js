import { body } from "express-validator";
import User from "../../smscr/users/user.schema.js";

const createAdminRules = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email address is required")
    .isEmail()
    .withMessage("Invalid email address")
    .custom(async value => {
      const user = await User.exists({ email: value }).exec();
      if (!user) return true;
      throw new Error("Email already exists");
    }),
  body("password").trim().notEmpty().withMessage("Password is required"),
  body("confirm_password")
    .trim()
    .notEmpty()
    .withMessage("Confirm Password is required")
    .custom((value, { req }) => {
      if (value === req.body.password) return true;
      throw new Error("Confirm Password and Password must match");
    }),
  body("firstname").trim().notEmpty().withMessage("Firstname is required"),
  body("lastname").trim().notEmpty().withMessage("Lastname is required"),
  body("account_role")
    .trim()
    .notEmpty()
    .withMessage("Account role is required")
    .custom(value => {
      const roles = [process.env.STUDENTADMIN, process.env.TEACHERADMIN];
      if (roles.includes(value)) return true;
      throw new Error("Invalid account role");
    }),
];

export default createAdminRules;
