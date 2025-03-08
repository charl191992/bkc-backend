import { body } from "express-validator";
import { DateTime } from "luxon";

const createRequestScheduleRules = [
  body("scheduleId")
    .trim()
    .notEmpty()
    .withMessage("Schedule id is required")
    .isMongoId()
    .withMessage("Invalid schedule id"),
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
];

export default createRequestScheduleRules;
