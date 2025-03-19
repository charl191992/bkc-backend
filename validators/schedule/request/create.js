import { body, check } from "express-validator";
import { DateTime } from "luxon";
import getToken from "../../../utils/get-token.js";
import Subject from "../../../smscr/subjects/subject.schema.js";

const createRequestScheduleRules = [
  body("scheduleId")
    .trim()
    .notEmpty()
    .withMessage("Schedule id is required")
    .isMongoId()
    .withMessage("Invalid schedule id"),
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
];

export default createRequestScheduleRules;
