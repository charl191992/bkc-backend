import { DateTime } from "luxon";
import CustomError from "../../utils/custom-error.js";
import Schedule from "./schedule.schema.js";
import toObjID from "../../utils/object-id.js";
import { student } from "../../utils/roles.js";
import { get_user_timezone } from "../../utils/get-timezone.js";
import * as calendarService from "../calendars/calendar.service.js";
import { server_utc_time } from "../../constants/server-time.js";

export const get_own_class_schedule = async (owner, limit, offset, page) => {
  try {
    const filter = { owner };

    const countPromise = Schedule.countDocuments(filter);
    const schedulesPromise = Schedule.find(filter)
      .populate({
        path: "subject",
        select: "label",
      })
      .sort({
        createdAt: -1,
      })
      .skip(offset)
      .limit(limit)
      .exec();

    const [count, schedules] = await Promise.all([
      countPromise,
      schedulesPromise,
    ]);

    const hasNextPage = count > offset + limit;
    const hasPrevPage = page > 1;
    const totalPages = Math.ceil(count / limit);

    return {
      success: true,
      schedules,
      hasNextPage,
      hasPrevPage,
      totalPages,
    };
  } catch (error) {
    throw new CustomError(
      error.message || "Failed to get available schedules",
      error.statusCode || 500
    );
  }
};

export const get_class_schedule_by_user_type = async (
  user,
  userType,
  limit,
  offset,
  page
) => {
  try {
    const current = server_utc_time.plus({ hours: 12 });

    const filter = {
      status: "available",
      ownerRole: userType,
      owner: { $ne: toObjID(user) },
      classroom: null,
      "dateTime.start": { $gte: current },
    };

    const countPromise = Schedule.countDocuments(filter);
    const schedulesPromise = Schedule.aggregate([
      { $match: filter },
      { $sort: { createdAt: -1 } },
      { $skip: offset },
      { $limit: limit },
      {
        $lookup: {
          from: "subjects",
          localField: "subject",
          foreignField: "_id",
          as: "subject",
          pipeline: [{ $project: { _id: 1, label: 1 } }],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
          pipeline: [{ $project: { "details.name": 1, display_image: 1 } }],
        },
      },
      { $addFields: { owner: { $arrayElemAt: ["$owner", 0] } } },
      {
        $lookup: {
          from: "requestschedules",
          let: { dateStart: "$dateTime.start", dateEnd: "$dateTime.end" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$requestedBy", toObjID(user)] },
                    { $eq: ["$schedule.start", "$$dateStart"] },
                    { $eq: ["$status", "pending"] },
                  ],
                },
              },
            },
          ],
          as: "request",
        },
      },
      {
        $addFields: {
          hasRequest: {
            $gt: [{ $size: "$request" }, 0],
          },
        },
      },
      { $project: { request: 0 } },
    ]).exec();

    const [count, schedules] = await Promise.all([
      countPromise,
      schedulesPromise,
    ]);

    const hasNextPage = count > offset + limit;
    const hasPrevPage = page > 1;
    const totalPages = Math.ceil(count / limit);

    return {
      success: true,
      schedules,
      hasNextPage,
      hasPrevPage,
      totalPages,
    };
  } catch (error) {
    throw new CustomError(
      error.message || "Failed to get available schedules",
      error.statusCode || 500
    );
  }
};

export const create_available_class_schedule = async (
  owner,
  data,
  userType
) => {
  try {
    const timezone = await get_user_timezone(owner._id);
    const zoneOpts = { zone: timezone };

    const { dateStart, dateEnd, description, subject } = data;
    const startUTC = DateTime.fromISO(dateStart, zoneOpts).toUTC().toJSDate();
    const endUTC = DateTime.fromISO(dateEnd, zoneOpts).toUTC().toJSDate();
    await schedule_overlap_check(owner._id, startUTC, endUTC);

    const schedule = await new Schedule({
      owner: owner._id,
      description: description || "",
      status: "available",
      subject: owner.role === student ? subject : null,
      ownerRole: userType,
      dateTime: {
        start: startUTC,
        end: endUTC,
      },
      timezone,
    }).save();

    if (!schedule)
      throw new CustomError("Failed to create a new schedule", 500);

    return {
      success: true,
      schedule: await schedule.populate({
        path: "subject",
        select: "label",
      }),
    };
  } catch (error) {
    throw new CustomError(
      error.message || "Failed to create available schedule",
      error.statusCode || 500
    );
  }
};

export const update_available_class_schedule = async (id, owner, data) => {
  try {
    const { dateStart, dateEnd, timezone_update, description } = data;
    let timezone;

    if (timezone_update) {
      timezone = await get_user_timezone(owner._id);
    }

    if (!timezone_update) {
      const schedule = await Schedule.findById(id).exec();
      if (!schedule) throw new CustomError("Available schedule not found", 404);
      timezone = schedule.timezone;
    }

    const filter = { _id: id, owner: owner._id, type: "class" };
    const options = { new: true };
    const zoneOpts = { zone: timezone };

    const startUTC = DateTime.fromISO(dateStart, zoneOpts).toUTC().toJSDate();
    const endUTC = DateTime.fromISO(dateEnd, zoneOpts).toUTC().toJSDate();
    await schedule_overlap_check(owner._id, startUTC, endUTC);
    await calendarService.check_overlap(owner._id, startUTC, endUTC);

    const updates = {
      $set: {
        "dateTime.start": startUTC,
        "dateTime.end": endUTC,
        description,
      },
    };

    if (owner.role === student) updates.$set.subject = data.subject;
    if (timezone_update) updates.$set.timezone = timezone;

    const updated = await Schedule.findOneAndUpdate(filter, updates, options)
      .populate({ path: "subject", select: "label" })
      .exec();

    if (!updated) throw new CustomError("Schedule not found", 404);

    return {
      success: true,
      schedule: updated,
    };
  } catch (error) {
    throw new CustomError(
      error.message || "Failed to update available schedule",
      error.statusCode || 500
    );
  }
};

export const delete_own_class_schedule = async (id, owner) => {
  try {
    const filter = { _id: id, owner, type: "class" };
    const deleted = await Schedule.deleteOne(filter).exec();
    if (deleted.deletedCount < 1) {
      throw new CustomError("Failed to delete available schedule", 400);
    }
    return {
      success: true,
      schedule: id,
    };
  } catch (error) {
    throw new CustomError(
      error.message || "Failed to delete available schedule",
      error.statusCode || 500
    );
  }
};

export const check_for_overlap_schedules = async (
  owner,
  requestor,
  start,
  end,
  session = null
) => {
  const filter = {
    type: "class",
    $and: [
      { "dateTime.start": { $lt: end } },
      { "dateTime.end": { $gt: start } },
    ],
  };

  const ownQuery = Schedule.exists({ owner: owner, ...filter });
  const otherQuery = Schedule.exists({ owner: requestor, ...filter });

  if (session) {
    ownQuery.session(session);
    otherQuery.session(session);
  }

  const [own, other] = await Promise.all[(ownQuery, otherQuery)];

  if (own) {
    throw new CustomError(
      "The schedule you want to confirm overlaps on your other schedule.",
      400
    );
  }

  if (other) {
    throw new CustomError(
      "The schedule you want to confirm overlaps with the requestor's other schedule.",
      400
    );
  }
};

export const schedule_overlap_check = async (
  owner,
  start,
  end,
  session = null
) => {
  const filter = {
    type: "class",
    $and: [
      { "dateTime.start": { $lt: end } },
      { "dateTime.end": { $gt: start } },
    ],
  };

  const query = Schedule.exists({ owner: owner, ...filter });
  if (session) query.session(session);
  const schedule = await query;

  if (schedule) {
    throw new CustomError(
      "The schedule you want to create overlaps on your other schedule.",
      400
    );
  }

  return schedule;
};
