import { DateTime } from "luxon";
import CustomError from "../../utils/custom-error.js";
import UserDetails from "../user_details/user-details.schema.js";
import Schedule from "./schedule.schema.js";

const get_my_own_schedule = async (
  owner,
  type,
  limit,
  offset,
  page,
  search
) => {
  try {
    const filter = {};
    if (search) filter.label = new RegExp(search, "i");

    const countPromise = Subject.countDocuments(filter);
    const subjectsPromise = Subject.find(filter)
      .sort({
        createdAt: -1,
      })
      .skip(offset)
      .limit(limit)
      .exec();

    const [count, subjects] = await Promise.all([
      countPromise,
      subjectsPromise,
    ]);

    const hasNextPage = count > offset + limit;
    const hasPrevPage = page > 1;
    const totalPages = Math.ceil(count / limit);

    return {
      success: true,
      subjects,
      hasNextPage,
      hasPrevPage,
      totalPages,
    };
  } catch (error) {
    throw new CustomError(
      error.message || "Failed to create available schedule",
      error.statusCode || 500
    );
  }
};

const get_my_requested_schedule = async (
  requestedBy,
  type,
  limit,
  offset,
  page,
  search
) => {
  try {
  } catch (error) {
    throw new CustomError(
      error.message || "Failed to create available schedule",
      error.statusCode || 500
    );
  }
};

export const create_available_class_schedule = async (owner, data) => {
  try {
    const details = await UserDetails.findOne({ user: owner }).exec();
    if (!details) throw new CustomError("User not found", 404);

    const startUTC = DateTime.fromISO(data.dateStart, {
      zone: details.timezone,
    })
      .toUTC()
      .toJSDate();
    const endUTC = DateTime.fromISO(data.dateEnd, { zone: details.timezone })
      .toUTC()
      .toJSDate();

    const overlap = await Schedule.exists({
      owner: owner,
      type: "class",
      $and: [
        { "dateTime.start": { $lt: endUTC } },
        { "dateTime.end": { $gt: startUTC } },
      ],
    });

    if (overlap)
      throw new CustomError("Schedule overlaps with an existing one", 400);

    const schedule = await new Schedule({
      owner: owner,
      description: data?.description || "",
      ownership: "owned",
      status: "available",
      type: "class",
      dateTime: {
        start: startUTC,
        end: endUTC,
      },
      timezone: details.timezone,
    }).save();

    if (!schedule)
      throw new CustomError("Failed to create a new schedule", 500);

    return {
      success: true,
      schedule,
    };
  } catch (error) {
    throw new CustomError(
      error.message || "Failed to create available schedule",
      error.statusCode || 500
    );
  }
};

const update_own_schedule = async (id, owner, data) => {
  try {
  } catch (error) {
    throw new CustomError(
      error.message || "Failed to create available schedule",
      error.statusCode || 500
    );
  }
};

const delete_own_schedule = async (id, owner, data) => {
  try {
  } catch (error) {
    throw new CustomError(
      error.message || "Failed to create available schedule",
      error.statusCode || 500
    );
  }
};

const request_available_schedule = async (id, requestor, data) => {
  try {
  } catch (error) {
    throw new CustomError(
      error.message || "Failed to create available schedule",
      error.statusCode || 500
    );
  }
};
