import { DateTime } from "luxon";
import ScheduleDate from "./schedule-date.schema.js";
import CustomError from "../../utils/custom-error.js";
import User from "../users/user.schema.js";

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

export const user_joined_classroom = async (roomId, userId) => {
  const principal = await User.exists({ _id: userId, role: "principal" }).exec();

  const filter = { _id: roomId, $or: [{ teacher: userId }, { students: { $in: [userId] } }] };
  const options = { new: true };
  const updates = { $push: { inRoom: userId } };

  if (principal) {
    const room = await ScheduleDate.findById({ _id: roomId }).lean().exec();
    return room.inRoom;
  }

  if (!principal) {
    const isInRoom = await ScheduleDate.findOne({ _id: roomId, inRoom: { $in: [userId] } }).exec();
    if (isInRoom) return isInRoom.inRoom;

    const updateInRoom = await ScheduleDate.findOneAndUpdate(filter, updates, options).exec();
    if (!updateInRoom) throw new CustomError("Failed to join the room", 500);

    return updateInRoom.inRoom;
  }
};

export const go_to_classroom = async () => {};
