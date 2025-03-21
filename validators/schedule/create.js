import { body, check } from "express-validator";
import { DateTime } from "luxon";
import Subject from "../../smscr/subjects/subject.schema.js";
import getToken from "../../utils/get-token.js";
import { student } from "../../utils/roles.js";

const createScheduleRules = [
  check("subject")
    .if((value, { req }) => {
      const token = getToken(req);
      return token.role === student;
    })
    .trim()
    .isMongoId()
    .withMessage("Invalid subject")
    .custom(async value => {
      const subject = await Subject.exists({ _id: value });
      if (!subject) throw new Error("Invalid subject");
      return true;
    }),
  body("dateStart")
    .trim()
    .notEmpty()
    .withMessage("Date and time start is required")
    .custom(value => {
      const date = DateTime.fromISO(value, { zone: "utc" });
      if (!date.isValid) throw new Error("Invalid date format");
      if (date < DateTime.utc())
        throw new Error("Date and time start cannot be in the past");
      return true;
    }),
  body("dateEnd")
    .trim()
    .notEmpty()
    .withMessage("Date and time end is required")
    .custom((value, { req }) => {
      const startDate = DateTime.fromISO(req.body.dateStart, { zone: "utc" });
      const endDate = DateTime.fromISO(value, { zone: "utc" });

      if (!endDate.isValid) throw new Error("Invalid date format");
      if (endDate <= startDate)
        throw new Error("Date and time end must be after start time");
      return true;
    }),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string")
    .isLength({ max: 255 })
    .withMessage(
      "The description must consist of a maximum of 255 characters only."
    ),
];

export default createScheduleRules;
