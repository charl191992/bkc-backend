import { body, param } from "express-validator";
import { convertToDate, timePattern } from "../../utils/date.js";
import Application from "../../smscr/applications/application.schema.js";
import Interview from "../../smscr/interviews/interview.schema.js";

const updateInterviewRules = [
  param("id")
    .trim()
    .notEmpty()
    .withMessage("Interview Id is required")
    .isMongoId()
    .withMessage("Invalid interview id")
    .custom(async value => {
      const interview = await Interview.exists({ _id: value });
      if (!interview) throw new Error("Interview not found");
      return true;
    }),
  body("application")
    .trim()
    .notEmpty()
    .withMessage("Application Id is required")
    .isMongoId()
    .withMessage("Invalid application id")
    .custom(async value => {
      const application = await Application.exists({ _id: value });
      if (!application) throw new Error("Application not found");

      return true;
    }),
  body("date")
    .exists()
    .withMessage("Interview Date is required")
    .isISO8601()
    .withMessage("Invalid date format")
    .custom(value => {
      const selected = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected.getTime() < today.getTime()) {
        throw new Error("The interview date has already passed.");
      }
      return true;
    }),
  body("start_time")
    .exists()
    .withMessage("Interview Start Time is required")
    .isString()
    .withMessage("Start time must be a string")
    .matches(timePattern)
    .withMessage("Invalid start time format. Use HH:mm.")
    .custom((value, { req }) => {
      const selected = convertToDate(req.body.date, value);
      const today = new Date();
      if (selected.getTime() <= today.getTime()) {
        throw new Error(
          "Interview start time must not be less than the current time"
        );
      }
      return true;
    }),
  body("end_time")
    .exists()
    .withMessage("Interview End Time is required")
    .isString()
    .withMessage("End time must be a string")
    .matches(timePattern)
    .withMessage("Invalid end time format. Use HH:mm.")
    .custom((value, { req }) => {
      const start = convertToDate(req.body.date, req.body.start_time);
      const end = convertToDate(req.body.date, value);
      if (start.getTime() >= end.getTime()) {
        throw new Error(
          "Interview end time must not be less than the start time"
        );
      }
      return true;
    }),
];

export default updateInterviewRules;
