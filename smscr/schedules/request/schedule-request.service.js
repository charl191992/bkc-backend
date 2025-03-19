import { DateTime } from "luxon";
import { convertToUTC } from "../../../helpers/date-time.js";
import CustomError from "../../../utils/custom-error.js";
import Schedule from "../schedule.schema.js";
import RequestSchedule from "./schedule-request.schema.js";
import * as classroomService from "../../classrooms/classroom.service.js";
import * as scheduleService from "../schedule.service.js";
import { student, teacher } from "../../../utils/roles.js";
import { create_request_schedule_notif } from "../../notifications/notification.service.js";
import mongoose from "mongoose";
import { get_user_timezone } from "../../../utils/get-timezone.js";

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
        path: "subject",
        select: "label",
      })
      .populate({
        path: "schedule",
        populate: {
          path: "owner",
          select: "display_image details.name",
        },
      })
      .populate({
        path: "requestedTo",
        select: "details",
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
      status: { $nin: ["confirmed"] },
      type: type,
    };

    const countPromise = RequestSchedule.countDocuments(filter);
    const requestsPromise = RequestSchedule.find(filter)
      .populate({
        path: "schedule",
      })
      .populate({
        path: "subject",
        select: "label",
      })
      .populate({
        path: "requestedBy",
        select: "display_image details.name",
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

    const timezone = await get_user_timezone(requestedBy);

    let requestData = {
      schedule: schedule._id,
      requestedBy: requestedBy,
      requestedTo: schedule.owner,
      haveChanges: false,
      requestorType: type,
      status: "pending",
      subject: schedule.subject,
    };

    const newDateEndUTC = convertToUTC(data.dateEnd, timezone);

    if (schedule.dateTime.end.getTime() !== newDateEndUTC.getTime()) {
      requestData.haveChanges = true;
      requestData.scheduleChanges = { start: schedule.dateTime.start };
      requestData.scheduleChanges = { end: newDateEndUTC };
    }

    if (schedule.userType === "teacher") {
      requestData.subject = data.subject;
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

export const approval_rejection_of_request_by_type = async (
  currentUser,
  requestId,
  status
) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    let filter = {
      _id: requestId,
      requestedTo: currentUser._id,
      status: "pending",
    };

    const request = await RequestSchedule.findOne(filter)
      .populate({ path: "schedule" })
      .populate({
        path: "requestedBy",
        select: "details.name",
      })
      .session(session)
      .exec();

    if (!request)
      throw new CustomError(
        "Request not found or already rejected/cancelled.",
        400
      );

    const schedule = await Schedule.findOne({
      _id: request.schedule?._id,
    })
      .session(session)
      .exec();

    if (status === "confirm") {
      await scheduleService.check_for_overlap_schedule(
        currentUser._id,
        request.scheduleChanges.start,
        request.haveChanges
          ? request.scheduleChanges.end
          : request.schedule?.dateTime.end
      );
    }

    const updates = {
      $set: { status: status === "confirm" ? "confirmed" : "rejected" },
    };
    filter.updatedAt = request.updatedAt;
    const options = { new: true };

    const updated = await RequestSchedule.findOneAndUpdate(
      filter,
      updates,
      options
    )
      .populate({
        path: "schedule",
      })
      .populate({
        path: "requestedBy",
        select: "display_image details.name",
      })
      .session(session)
      .exec();

    if (!updated)
      throw new CustomError(
        `Failed to ${status} the request. Please check if it has not been rejected or canceled yet.`,
        500
      );

    if (status === "confirm") {
      const tcher =
        currentUser.role === teacher ? currentUser._id : request.requestedBy;
      const stdnt =
        currentUser.role === student ? currentUser._id : request.requestedBy;

      const result = await classroomService.create_classroom(
        tcher,
        stdnt,
        {
          start: schedule.dateTime.start,
          end: request.haveChanges
            ? request?.scheduleChanges?.end
            : schedule?.dateTime?.end,
          description: schedule?.description || "",
        },
        session
      );

      if (!result.success)
        throw new CustomError(
          "Failed to confirm the schedule. Please try again.",
          500
        );

      const updatedSched = await Schedule.findOneAndUpdate(
        {
          _id: schedule?._id,
          updatedAt: schedule.updatedAt,
          status: "available",
        },
        { $set: { classroom: result.classroom._id, subject: request.subject } },
        { new: true }
      ).session(session);

      if (!updatedSched)
        throw new CustomError(
          "Please check if the schedule you would like to confirm is still available.",
          400
        );
    }

    await create_request_schedule_notif(
      {
        requestSchedId: request._id,
        requestor: request.requestedBy?._id,
        requestorName: request.requestedBy?.details?.name?.fullname,
        status: status === "confirm" ? "confirmed" : "rejected",
      },
      session
    );

    await session.commitTransaction();

    return {
      success: true,
      request:
        status === "confirm"
          ? {
              ...updated._doc,
              schedule: { ...updated._doc.schedule, classroom: updated2Id },
            }
          : updated,
    };
  } catch (error) {
    await session.abortTransaction();
    throw new CustomError(
      error.message || `Failed to ${status} the request`,
      error.statusCode || 500
    );
  } finally {
    session.endSession();
  }
};
