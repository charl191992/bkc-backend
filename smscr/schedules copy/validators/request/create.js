import { body, check } from "express-validator";
import { DateTime } from "luxon";
import getToken from "../../../../utils/get-token.js";
import Subject from "../../../subjects/subject.schema.js";
import isIdValid from "../../../../utils/check-id.js";
import { get_user_timezone } from "../../../../utils/get-timezone.js";
import { server_utc_time } from "../../../../constants/server-time.js";

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
    .isArray({ min: 1 })
    .withMessage("Invalid subject list")
    .custom(async value => {
      if (!Array.isArray(value) || !value.every(val => isIdValid(val))) {
        throw new Error("Invalid subject ID");
      }

      const subjectCount = await Subject.countDocuments({
        _id: { $in: value },
      });
      if (subjectCount !== value.length) {
        throw new Error("One or more subjects do not exist");
      }

      return true;
    }),
  body("dateStart")
    .trim()
    .notEmpty()
    .withMessage("Date and time start is required")
    .custom(async (value, { req }) => {
      const token = getToken(req);
      const timezone = await get_user_timezone(token._id);
      const date = DateTime.fromISO(value, { zone: timezone }).toUTC();

      if (!date.isValid) throw new Error("Invalid date format");

      if (date < server_utc_time)
        throw new Error("Date and time start cannot be in the past");

      if (server_utc_time.plus({ hours: 12 }) > date)
        throw new Error(
          "The start time should be at least 12 hours before the schedule"
        );

      return true;
    }),
  body("dateEnd")
    .trim()
    .notEmpty()
    .withMessage("Date and time end is required")
    .custom((value, { req }) => {
      const { dateStart } = req.body;

      const startDate = DateTime.fromISO(dateStart, { zone: "utc" });
      const endDate = DateTime.fromISO(value, { zone: "utc" });

      if (!endDate.isValid) throw new Error("Invalid date format");

      if (endDate <= startDate)
        throw new Error("Date and time end must be after start time");

      if (endDate <= server_utc_time) {
        throw new Error(
          "Schedule already ended. Please select another schedule."
        );
      }

      if (startDate.plus({ hours: 1 }) > endDate)
        throw new Error(
          "Schedule should be at least one hour after the start."
        );

      return true;
    }),
];

export default createRequestScheduleRules;
