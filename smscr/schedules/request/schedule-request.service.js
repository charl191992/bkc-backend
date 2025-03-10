import { DateTime } from "luxon";
import { convertToUTC } from "../../../helpers/date-time.js";
import CustomError from "../../../utils/custom-error.js";
import UserDetails from "../../user_details/user-details.schema.js";
import Schedule from "../schedule.schema.js";
import RequestSchedule from "./schedule-request.schema.js";

export const get_own_request_by_type = async (
  currentUser,
  limit,
  offset,
  page
) => {
  try {
    const filter = { requestedBy: currentUser, status: { $ne: "confirmed" } };

    const countPromise = RequestSchedule.countDocuments(filter);
    const requestsPromise = RequestSchedule.find(filter)
      .populate({
        path: "schedule",
        populate: {
          path: "owner",
          select: "display_image",
          populate: {
            path: "details",
            select: "name",
          },
        },
      })
      .populate({
        path: "requestedBy",
        populate: {
          path: "details",
        },
      })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);

    const [count, requests] = await Promise.all([
      countPromise,
      requestsPromise,
    ]);

    const hasNextPage = count > offset + limit;
    const hasPrevPage = page > 1;
    const totalPages = Math.ceil(count / limit);

    return {
      success: true,
      requests,
      hasNextPage,
      hasPrevPage,
      totalPages,
    };
  } catch (error) {
    throw new CustomError(error.message || "Failed to get requested schedules");
  }
};

export const get_requesteds_by_type = async (
  currentUser,
  limit,
  offset,
  page,
  type
) => {
  try {
    const filter = {
      requestedTo: currentUser,
      status: { $nin: ["confirmed", "rejected"] },
      type: type,
    };

    const countPromise = RequestSchedule.countDocuments(filter);
    const requestsPromise = RequestSchedule.find(filter)
      .populate({
        path: "schedule",
      })
      .populate({
        path: "requestedBy",
        select: "display_image",
        populate: {
          path: "details",
          select: "name",
        },
      })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);

    const [count, requests] = await Promise.all([
      countPromise,
      requestsPromise,
    ]);

    const hasNextPage = count > offset + limit;
    const hasPrevPage = page > 1;
    const totalPages = Math.ceil(count / limit);

    return {
      success: true,
      requests,
      hasNextPage,
      hasPrevPage,
      totalPages,
    };
  } catch (error) {
    throw new CustomError(error.message || "Failed to get requested schedules");
  }
};

export const create_request_by_type = async (requestedBy, data, type) => {
  try {
    const schedule = await Schedule.findById(data.scheduleId).exec();
    if (!schedule) throw new CustomError("Schedule not found", 404);

    const current = DateTime.now().toUTC();
    const scheduleEnd = schedule.dateTime.end;

    if (scheduleEnd <= current) {
      throw new CustomError(
        "Schedule already ended. Please select another schedule."
      );
    }

    const haveRequest = await RequestSchedule.exists({
      requestedBy,
      schedule: schedule._id,
    }).exec();
    if (haveRequest)
      throw new CustomError(
        "A request for the selected schedule already exists.",
        400
      );

    const details = await UserDetails.findOne({ user: requestedBy }).exec();
    if (!schedule) throw new CustomError("User not found", 404);

    let requestData = {
      schedule: schedule._id,
      requestedBy: requestedBy,
      requestedTo: schedule.owner,
      haveChanges: false,
      requestorType: type,
      status: "pending",
    };

    const newDateEndUTC = convertToUTC(data.dateEnd, details.timezone);

    if (schedule.dateTime.end.getTime() !== newDateEndUTC.getTime()) {
      requestData.haveChanges = true;
      requestData.scheduleChanges = { start: schedule.dateTime.start };
      requestData.scheduleChanges = { end: newDateEndUTC };
    }

    const request = await new RequestSchedule(requestData).save();
    if (!request) throw new CustomError("Failed to send a request");

    return {
      success: true,
      request,
    };
  } catch (error) {
    throw new CustomError(
      error.message || "Failed to send a request",
      error.statusCode || 500
    );
  }
};

export const cancel_own_request = async (requestedBy, id) => {
  try {
    const filter = {
      _id: id,
      requestedBy: requestedBy,
      status: { $in: ["pending", "rejected"] },
    };

    const request = await RequestSchedule.findOne(filter).exec();
    if (!request)
      throw new CustomError(
        "The request was not found or has already been confirmed."
      );

    filter.__v = request.__v;
    const cancelled = await RequestSchedule.findOneAndDelete(filter);
    if (!cancelled)
      throw new CustomError(
        "Failed to cancel the request. Please ensure the request has not been confirmed yet.",
        500
      );

    return {
      success: true,
      request: cancelled._id,
    };
  } catch (error) {
    throw new CustomError(
      error.message || "Failed to cancel the request.",
      error.statusCode || 500
    );
  }
};
