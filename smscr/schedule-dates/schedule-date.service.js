import { DateTime } from "luxon";
import ScheduleDate from "./schedule-date.schema.js";

export const get_own_schedule = async (token, start, end) => {
  const startDate = new Date(start);
  startDate.setUTCHours(0, 0, 0, 0);

  const endDate = new Date(end);
  endDate.setUTCHours(23, 59, 59, 999);

  const filter = {
    $or: [{ teacher: token._id }, { students: { $in: [token._id] } }],
    date: { $gte: startDate, $lte: endDate },
  };
  const schedules = await ScheduleDate.find(filter)
    .populate({ path: "teacher", select: "display_image details.name.fullname -_id" })
    .populate({ path: "students", select: "display_image details.name.fullname -_id" })
    .lean()
    .exec();

  return {
    success: true,
    schedules,
  };
};

export const go_to_classroom = async () => {};
