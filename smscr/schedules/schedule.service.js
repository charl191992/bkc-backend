import { DateTime } from "luxon";
import CustomError from "../../utils/custom-error.js";
import Schedule from "./schedule.schema.js";
import toObjID from "../../utils/object-id.js";
import { student } from "../../utils/roles.js";
import { get_user_timezone } from "../../utils/get-timezone.js";

export const get_own_class_schedule = async (owner, limit, offset, page) => {
  try {
    const filter = { owner, type: "class" };

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

export const create_available_class_schedule = async (
  owner,
  data,
  userType
) => {
  try {
    const timezone = await get_user_timezone(owner._id);

    const startUTC = DateTime.fromISO(data.dateStart, {
      zone: timezone,
    })
      .toUTC()
      .toJSDate();
    const endUTC = DateTime.fromISO(data.dateEnd, { zone: timezone })
      .toUTC()
      .toJSDate();

    const overlap = await Schedule.exists({
      owner: owner._id,
      type: "class",
      $and: [
        { "dateTime.start": { $lt: endUTC } },
        { "dateTime.end": { $gt: startUTC } },
      ],
    });

    if (overlap)
      throw new CustomError("Schedule overlaps with an existing one", 400);

    const schedule = await new Schedule({
      owner: owner._id,
      description: data?.description || "",
      status: "available",
      type: "class",
      subject: owner.role === student ? data?.subject : null,
      userType,
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
    let timezone;
    const timezone_update = data.timezone_update;

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

    const startUTC = DateTime.fromISO(data.dateStart, {
      zone: timezone,
    })
      .toUTC()
      .toJSDate();

    const endUTC = DateTime.fromISO(data.dateEnd, { zone: timezone })
      .toUTC()
      .toJSDate();

    const overlap = await Schedule.exists({
      _id: { $ne: id },
      owner: owner._id,
      type: "class",
      $and: [
        { "dateTime.start": { $lt: endUTC } },
        { "dateTime.end": { $gt: startUTC } },
      ],
    });

    if (overlap)
      throw new CustomError("Schedule overlaps with an existing one", 400);

    const updates = {
      $set: {
        "dateTime.start": startUTC,
        "dateTime.end": endUTC,
        description: data.description,
      },
    };

    if (owner.role === student) {
      updates.$set.subject = data.subject;
    }

    if (timezone_update) updates.$set.timezone = timezone;

    const updated = await Schedule.findOneAndUpdate(filter, updates, options)
      .populate({
        path: "subject",
        select: "label",
      })
      .exec();

    if (!updated) throw new CustomError("Schedule not found", 404);

    return {
      success: true,
      schedule: updated,
    };
  } catch (error) {
    throw new CustomError(
      error.message || "Failed to create available schedule",
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

export const get_class_schedule_by_user_type = async (
  user,
  userType,
  limit,
  offset,
  page
) => {
  try {
    const filter = {
      type: "class",
      status: "available",
      userType,
      owner: { $ne: toObjID(user) },
    };
    const countPromise = Schedule.countDocuments(filter);
    const schedulesPromise = Schedule.aggregate([
      {
        $match: filter,
      },
      {
        $lookup: {
          from: "subjects",
          localField: "subject",
          foreignField: "_id",
          as: "subject",
        },
      },
      {
        $addFields: {
          subject: {
            $cond: {
              if: { $gt: [{ $size: "$subject" }, 0] },
              then: { $arrayElemAt: ["$subject", 0] },
              else: null,
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
        },
      },
      {
        $unwind: "$owner",
      },
      {
        $project: {
          "owner.role": 0,
          "owner.password": 0,
          "owner.status": 0,
          "owner.application": 0,
          "owner.enrollment": 0,
          "owner.updatedAt": 0,
          "owner.createdAt": 0,
          "owner.details.address": 0,
          "owner.details.user": 0,
          "owner.details.timezone": 0,
          "owner.details.createdAt": 0,
          "owner.details.updatedAt": 0,
          "subject.createdAt": 0,
          "subject.updatedAt": 0,
          "subject.status": 0,
          "subject.__v": 0,
        },
      },
      {
        $lookup: {
          from: "requestschedules",
          let: { scheduleId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$schedule", "$$scheduleId"],
                    },
                    {
                      $eq: ["$requestedBy", toObjID(user)],
                    },
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
      {
        $project: {
          request: 0,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      { $skip: offset },
      { $limit: limit },
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

export const check_for_overlap_schedule = async (owner, start, end) => {
  const overlap = await Schedule.exists({
    owner,
    type: "class",
    $and: [
      { "dateTime.start": { $lt: end } },
      { "dateTime.end": { $gt: start } },
    ],
  });
  if (overlap)
    throw new CustomError("Schedule overlaps with an existing one", 400);
};
