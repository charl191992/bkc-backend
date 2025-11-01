import { DateTime } from "luxon";
import Schedule from "./schedule.schema.js";
import { get_user_timezone } from "../../utils/get-timezone.js";
import { convertToUTC } from "../../helpers/date-time.js";
import Recommendation from "../recommendation/recommendation.schema.js";
import CustomError from "../../utils/custom-error.js";
import mongoose from "mongoose";
import { setScheduleDates } from "../../utils/schedule.js";
import ScheduleDate from "../schedule-dates/schedule-date.schema.js";
import User from "../users/user.schema.js";
import Enrollment from "../enrollments/enrollment.schema.js";

export const create_schedule = async (data, token) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const timezone = await get_user_timezone(token._id);
    const subscription_start = convertToUTC(data.subscription_start, timezone);
    const subscription_end = DateTime.fromJSDate(subscription_start).plus({ months: data.months }).toJSDate();

    const recommendation = await Recommendation.findById(data.recommendation).populate({ path: "enrollment" }).lean().exec();

    const schedule = await new Schedule({
      teacher: data.teacher,
      students: [data.student],
      days: recommendation.schedule.days,
      months: data.months,
      subscription_start: subscription_start,
      subscription_end: subscription_end,
      time_start: recommendation.schedule.time_start,
      time_end: recommendation.schedule.time_end,
    }).save({ session });

    if (!schedule) {
      throw new CustomError("Failed to create a schedule and subscription", 500);
    }

    const scheduleData = {
      start: schedule.subscription_start,
      end: schedule.subscription_end,
      scheduleId: schedule._id,
      teacher: schedule.teacher,
      students: schedule.students,
      recommendedDays: schedule.days,
      time_start: schedule.time_start,
      time_end: schedule.time_end,
      subjects: [...recommendation.enrollment.subjects.map(subject => subject.label), recommendation.enrollment.requestedSubjects.map(subject => subject.label)].flat(),
    };

    const scheduleDates = setScheduleDates(scheduleData);

    await ScheduleDate.insertMany(scheduleDates, { session });
    await User.updateMany({ _id: { $in: schedule.students } }, { status: "active" }, { session });
    await Enrollment.updateMany({ student: { $in: schedule.students } }, { status: "approved" }, { session });

    await session.commitTransaction();

    return {
      success: true,
      schedule,
    };
  } catch (error) {
    await session.abortTransaction();
    throw new CustomError(error.message || "Failed to create a schedule and subscription", error.statusCode || 500);
  } finally {
    await session.endSession();
  }
};

export const getScheduleByMonth = (token, month) => {};
