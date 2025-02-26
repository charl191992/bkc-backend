import { body } from "express-validator";
import User from "../../smscr/users/user.schema.js";
import { student } from "../../utils/roles.js";
import Level from "../../smscr/levels/level.schema.js";
import Country from "../../smscr/countries/country.schema.js";
import Subject from "../../smscr/subjects/subject.schema.js";
import { DateTime } from "luxon";

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
  body("display_name")
    .trim()
    .notEmpty()
    .withMessage("Display name is required")
    .isLength({ min: 1, max: 255 })
    .withMessage("Display name must only contain 1 to 255 characters"),
  body("firstname")
    .trim()
    .notEmpty()
    .withMessage("Firstname is required")
    .isLength({ min: 1, max: 255 })
    .withMessage("Firstname must only contain 1 to 255 characters"),
  body("middlename")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Middlename is required")
    .isLength({ min: 1, max: 255 })
    .withMessage("Middlename must only contain 1 to 255 characters"),
  body("lastname")
    .trim()
    .notEmpty()
    .withMessage("Lastname is required")
    .isLength({ min: 1, max: 255 })
    .withMessage("Lastname must only contain 1 to 255 characters"),
  body("extname")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Extension name is required")
    .isLength({ min: 1, max: 255 })
    .withMessage("Extension name must only contain 1 to 255 characters"),
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
  body("father_name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Father name is required")
    .isLength({ min: 1, max: 255 })
    .withMessage("Father name must only contain 1 to 255 characters"),
  body("father_contact")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Father contact is required")
    .isLength({ min: 1, max: 255 })
    .withMessage("Father contact must only contain 1 to 255 characters"),
  body("mother_name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Mother name is required")
    .isLength({ min: 1, max: 255 })
    .withMessage("Mother name must only contain 1 to 255 characters"),
  body("mother_contact")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Mother contact is required")
    .isLength({ min: 1, max: 255 })
    .withMessage("Mother contact must only contain 1 to 255 characters"),
  body("guardian_name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Guardian name is required")
    .isLength({ min: 1, max: 255 })
    .withMessage("Guardian name must only contain 1 to 255 characters"),
  body("guardian_contact")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Guardian contact is required")
    .isLength({ min: 1, max: 255 })
    .withMessage("Guardian contact must only contain 1 to 255 characters"),
  body("address_one")
    .trim()
    .notEmpty()
    .withMessage("Permanent address is required")
    .isLength({ min: 1, max: 255 })
    .withMessage("Permanent address must only contain 1 to 255 characters"),
  body("address_two")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Secondary address is required")
    .isLength({ min: 1, max: 255 })
    .withMessage("Secondary address must only contain 1 to 255 characters"),
  body("city")
    .trim()
    .notEmpty()
    .withMessage("City is required")
    .isLength({ min: 1, max: 255 })
    .withMessage("City must only contain 1 to 255 characters"),
  body("province")
    .trim()
    .notEmpty()
    .withMessage("Province is required")
    .isLength({ min: 1, max: 255 })
    .withMessage("Province must only contain 1 to 255 characters"),
  body("country")
    .trim()
    .notEmpty()
    .withMessage("Country is required")
    .isLength({ min: 1, max: 255 })
    .withMessage("Country must only contain 1 to 255 characters")
    .custom(async value => {
      const country = await Country.exists({ _id: value });
      if (!country) throw Error("Invalid country");
      return true;
    }),
  body("zip")
    .trim()
    .notEmpty()
    .withMessage("Zip is required")
    .isLength({ min: 1, max: 255 })
    .withMessage("Zip must only contain 1 to 255 characters"),
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
    .isMongoId()
    .withMessage("Invalid grade level")
    .isLength({ min: 1, max: 255 })
    .withMessage("Grade Level must only contain 1 to 255 characters")
    .custom(async value => {
      const gradeLevel = await Level.exists({ _id: value });
      if (!gradeLevel) throw Error("Invalid grade level");
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
    const ids = subjects.map(e => e.value);
    const subs = await Subject.countDocuments({ _id: { $in: ids } }).exec();
    if (ids.length !== subs) throw Error("Subjects have an invalid value");
    return true;
  }),
  body("days").custom(async value => {
    const days = JSON.parse(value);
    if (!Array.isArray(days)) throw Error("Invalid days");
    if (days.length < 1) throw Error("Days is required");
    return true;
  }),
  body("hours_per_session")
    .trim()
    .notEmpty()
    .withMessage("Hours per session is required")
    .custom(value => {
      if (isNaN(value)) throw new Error("Hours per session must be a number");

      const num = Number(value);
      if (!Number.isInteger(num) || num < 1)
        throw new Error("Hours per session must not be less than 1");

      return true;
    }),
];

export default enrollmentRules;
