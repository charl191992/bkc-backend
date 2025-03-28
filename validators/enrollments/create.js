import { body } from "express-validator";
import User from "../../smscr/users/user.schema.js";
import { student } from "../../utils/roles.js";
import EducationLevel from "../../smscr/education-levels/education-level.schema.js";
import { DateTime } from "luxon";
import isIdValid from "../../utils/check-id.js";

const enrollmentRules = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address")
    .custom(async value => {
      const user = await User.exists({ email: value, role: student });
      if (user) throw Error("Email already exist.");
      return true;
    }),
  body("firstname")
    .trim()
    .notEmpty()
    .withMessage("Firstname is required")
    .isLength({ min: 1, max: 255 })
    .withMessage("Firstname must only contain 1 to 255 characters"),
  body("lastname")
    .trim()
    .notEmpty()
    .withMessage("Lastname is required")
    .isLength({ min: 1, max: 255 })
    .withMessage("Lastname must only contain 1 to 255 characters"),
  body("gender")
    .trim()
    .notEmpty()
    .withMessage("Gender is required")
    .isLength({ min: 1, max: 255 })
    .withMessage("Gender must only contain 1 to 255 characters")
    .custom(value => {
      if (!["male", "female"].includes(value.toLocaleLowerCase())) {
        throw Error("Invalid gender selected");
      }
      return true;
    }),
  body("birthdate")
    .trim()
    .notEmpty()
    .withMessage("Birthdate is required")
    .custom(value => {
      const parsedDate = DateTime.fromISO(value);
      if (!parsedDate.isValid) {
        throw new Error("Birthdate must be a valid date");
      }
      return true;
    }),
  body("contact")
    .trim()
    .notEmpty()
    .withMessage("Contact is required")
    .isLength({ min: 1, max: 255 })
    .withMessage("Contact must only contain 1 to 255 characters"),
  body("nationality")
    .trim()
    .notEmpty()
    .withMessage("Nationality is required")
    .isLength({ min: 1, max: 255 })
    .withMessage("Nationality must only contain 1 to 255 characters"),
  body("parent_name")
    .trim()
    .notEmpty()
    .withMessage("Parent / Guardian's Name is required")
    .isLength({ min: 1, max: 255 })
    .withMessage(
      "Parent / Guardian's Name must only contain 1 to 255 characters"
    ),
  body("parent_contact")
    .trim()
    .notEmpty()
    .withMessage("Parent / Guardian's Contact is required")
    .isLength({ min: 1, max: 255 })
    .withMessage(
      "Parent / Guardian's Contact must only contain 1 to 255 characters"
    ),
  body("parent_email")
    .trim()
    .notEmpty()
    .withMessage("Parent / Guardian's email is required")
    .isEmail()
    .withMessage("Parent / Guardian's email should be a valid email")
    .isLength({ min: 1, max: 255 })
    .withMessage(
      "Parent / Guardian's email must only contain 1 to 255 characters"
    ),
  body("address")
    .trim()
    .notEmpty()
    .withMessage("Permanent address is required")
    .isLength({ min: 1, max: 255 })
    .withMessage("Permanent address must only contain 1 to 255 characters"),
  body("country")
    .trim()
    .exists({ checkFalsy: true })
    .withMessage("Country is required"),
  body("school")
    .trim()
    .notEmpty()
    .withMessage("School is required")
    .isLength({ min: 1, max: 255 })
    .withMessage("School must only contain 1 to 255 characters"),
  body("grade_level")
    .trim()
    .notEmpty()
    .withMessage("Grade Level is required")
    .isLength({ min: 1, max: 255 })
    .withMessage("Grade Level must only contain 1 to 255 characters")
    .custom(async (value, { req }) => {
      const isRequested = req.body.is_requested_grade_level === "true";
      if (!isRequested) {
        if (!isIdValid(value)) throw new Error("Invalid grade level");
        const gradeLevel = await EducationLevel.exists({ _id: value });
        if (!gradeLevel) throw Error("Invalid grade level");
      }
      return true;
    }),
  body("mode")
    .trim()
    .notEmpty()
    .withMessage("Mode is required")
    .isLength({ min: 1, max: 255 })
    .withMessage("Mode must only contain 1 to 255 characters"),
  body("purpose")
    .trim()
    .notEmpty()
    .withMessage("Purpose is required")
    .isLength({ min: 1, max: 255 })
    .withMessage("Purpose must only contain 1 to 255 characters"),
  body("subjects").custom(async value => {
    const subjects = JSON.parse(value);
    if (!Array.isArray(subjects)) throw Error("Invalid subjects");
    if (subjects.length < 1) throw Error("Subjects is required");
    return true;
  }),
  body("days").custom(async value => {
    const days = JSON.parse(value);
    if (!Array.isArray(days)) throw Error("Invalid days");
    if (days.length < 1) throw Error("Days is required");
    return true;
  }),
  body("time_start")
    .trim()
    .notEmpty()
    .withMessage("Time start is required")
    .custom(async value => {
      const time_start = DateTime.fromFormat(value, "HH:mm");
      if (!time_start.isValid) throw new Error("Invalid time start");
      return true;
    }),
  body("time_end")
    .trim()
    .notEmpty()
    .withMessage("Time end is required")
    .custom((value, { req }) => {
      const time_end = DateTime.fromFormat(value, "HH:mm");
      if (!time_end.isValid) throw new Error("Invalid time end");
      const time_start = DateTime.fromFormat(req.body.time_start, "HH:mm");
      if (time_start.plus({ hours: 1 }) > time_end) {
        throw new Error("Minimum of atleast 1 hour per session");
      }
      return true;
    }),
  body("timezone")
    .trim()
    .notEmpty()
    .withMessage("Timezone is required")
    .custom(value => {
      try {
        const timezone = value.trim();
        const dt = DateTime.now().setZone(timezone);
        if (!dt.isValid) throw new Error("Invalid IANA Timezone string");
        return true;
      } catch (error) {
        throw new Error("Invalid IANA Timezone string");
      }
    }),
];

export default enrollmentRules;
