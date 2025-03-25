import CustomError from "../../utils/custom-error.js";
import Calendar from "./calendar.schema.js";

export const create_requested_class_calendar = async (
  users,
  classStart,
  classEnd,
  classroom,
  session = null
) => {
  try {
    await check_requested_overlaps(
      users[0],
      users[1],
      classStart,
      classEnd,
      session
    );

    const options = session ? { session } : {};
    const datas = users.map(e => ({
      user: e,
      type: "class",
      schedule: {
        start: classStart,
        end: classEnd,
      },
      classroom,
    }));

    const calendars = await Calendar.insertMany(datas, options);

    if (calendars.length !== users.length)
      throw new CustomError("Failed to create a calendar data", 500);

    return {
      success: true,
      calendars,
    };
  } catch (error) {
    throw new CustomError(
      error.message || "Failed to create a calendar data",
      error.statusCode || 500
    );
  }
};

export const check_requested_overlaps = async (
  owner,
  requestor,
  classStart,
  classEnd,
  session = null
) => {
  const filter = {
    type: "class",
    $and: [
      { "schedule.start": { $lt: classEnd } },
      { "schedule.end": { $gt: classStart } },
    ],
  };

  const tcQuery = Calendar.exists({ ...filter, owner: owner });
  const stQuery = Calendar.exists({ ...filter, owner: requestor });

  if (session) {
    tcQuery.session(session);
    stQuery.session(session);
  }

  const [tc, st] = await Promise.all([tcQuery, stQuery]);

  if (tc) {
    throw new CustomError(
      "The schedule you want to confirm overlaps on your other schedule.",
      400
    );
  }

  if (st) {
    throw new CustomError(
      "The schedule you want to confirm overlaps with the requestor's other schedule.",
      400
    );
  }
};

export const check_overlap = async (owner, start, end, session = null) => {
  const filter = {
    type: "class",
    $and: [
      { "schedule.start": { $lt: end } },
      { "schedule.end": { $gt: start } },
    ],
  };

  const query = Calendar.exists({ ...filter, owner: owner });
  if (session) query.session(session);

  const overlap = await query;

  if (overlap) {
    throw new CustomError(
      "The schedule you want to create overlaps on your other schedule.",
      400
    );
  }
};

export const get_calendar_schedules = async (user, start, end) => {
  try {
    const filter = {
      user: user._id,
      "schedule.start": { $gt: start },
      "schedule.end": { $lt: end },
    };

    const calendars = await Calendar.find(filter)
      .select("-createdAt -updatedAt -user -__v")
      .populate({
        path: "classroom",
        select: "teacher students subjects description",
        populate: [
          {
            path: "teacher",
            select: "display_image details.name.fullname -_id",
          },
          {
            path: "students",
            select: "display_image details.name.fullname -_id",
          },
          {
            path: "subjects",
            select: "label -_id",
          },
        ],
      })
      .exec();

    return {
      success: true,
      calendars,
    };
  } catch (error) {
    throw new CustomError(
      error.message || "Failed to get calendar schedules",
      error.statusCode || 500
    );
  }
};
