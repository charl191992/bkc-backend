import { body } from "express-validator";
import Recommendation from "../recommendation/recommendation.schema.js";
import User from "../users/user.schema.js";
import Schedule from "./schedule.schema.js";
import { teacher } from "../../utils/roles.js";
import { get_user_timezone } from "../../utils/get-timezone.js";
import getToken from "../../utils/get-token.js";
import { convertToUTC } from "../../helpers/date-time.js";
import { DateTime } from "luxon";
import { isValidObjectId } from "mongoose";

export const createScheduleRules = [
  body("recommendation")
    .trim()
    .notEmpty()
    .withMessage("Recommendation id is required")
    .isMongoId()
    .withMessage("Invalid recommendation id")
    .custom(async value => {
      const exists = await Recommendation.exists({ _id: value, deletedAt: null });
      if (!exists) throw new Error("Please make sure that the enrollee is for recommendation");
      return true;
    }),
  body("student")
    .trim()
    .notEmpty()
    .withMessage("Student id is required")
    .isMongoId()
    .withMessage("Invalid student id")
    .custom(async value => {
      const exists = await User.exists({ _id: value, deletedAt: null });
      if (!exists) throw new Error("Student not found");
      return true;
    }),
  body("teacherLabel")
    .trim()
    .notEmpty()
    .withMessage("Please select a educator")
    .custom(async (value, { req }) => {
      const teacherId = req.body.teacher;
      if (!isValidObjectId(teacherId)) throw new Error("Invalid educator");

      const teacherExists = await User.exists({ _id: teacherId, role: teacher, status: "active" });
      if (!teacherExists) throw new Error("Educator not found or inactive");

      const token = getToken(req);
      const timezone = await get_user_timezone(token._id);
      const subscription_start = convertToUTC(req.body.subscription_start, timezone);
      const subscription_end = DateTime.fromJSDate(subscription_start).plus({ months: req.body.months }).toJSDate();

      const hasSubscriptionOverlap = await Schedule.exists({
        teacher: teacherId,
        deletedAt: null,
        $or: [{ subscription_start: { $lte: subscription_end }, subscription_end: { $gte: subscription_start } }],
      });
      if (!hasSubscriptionOverlap) return true;

      const recommendation = await Recommendation.findById(req.body.recommendation).lean().exec();
      const timeConflict = await Schedule.exists({
        teacher: teacherId,
        deletedAt: null,
        subscription_start: { $lte: subscription_end },
        subscription_end: { $gte: subscription_start },
        $expr: {
          $and: [{ $lt: ["$time_start", recommendation.schedule.time_end] }, { $gt: ["$time_end", recommendation.schedule.time_start] }],
        },
      });

      if (timeConflict) throw new Error("Educator has a conflicting schedule during this time slot");

      return true;
    }),
  body("months").trim().notEmpty().withMessage("Subscription months is required").isNumeric().withMessage("Subscription months must be a number"),
];
