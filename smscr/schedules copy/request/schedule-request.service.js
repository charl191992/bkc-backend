import { DateTime } from "luxon";
import CustomError from "../../../utils/custom-error.js";
import Schedule from "../schedule.schema.js";
import RequestSchedule from "./schedule-request.schema.js";
import * as classroomService from "../../classrooms/classroom.service.js";
import * as scheduleService from "../schedule.service.js";
import { student, teacher } from "../../../utils/roles.js";
import { create_request_schedule_notif } from "../../notifications/notification.service.js";
import mongoose from "mongoose";
import { get_user_timezone } from "../../../utils/get-timezone.js";
import * as calendarService from "../../calendars/calendar.service.js";
import { server_utc_time } from "../../../constants/server-time.js";

export const get_own_request_by_type = async (
  currentUser,
  limit,
  offset,
  page
) => {
  try {
    const filter = { requestedBy: currentUser };

    const countPromise = RequestSchedule.countDocuments(filter);
    const requestsPromise = RequestSchedule.find(filter)
      .populate({
        path: "subject",
        select: "label",
      })
      .populate({
        path: "requestedTo",
        select: "details.name.fullname display_image",
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
    const current = server_utc_time.plus({ hours: 6 });

    const filter = {
      requestedTo: currentUser,
      status: "pending",
      requestorType: type,
      "schedule.start": { $gte: current },
    };

    const countPromise = RequestSchedule.countDocuments(filter);
    const requestsPromise = RequestSchedule.find(filter)
      .populate({
        path: "subject",
        select: "label",
      })
      .populate({
        path: "requestedBy",
        select: "details.name.fullname display_image",
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
    const { scheduleId, dateStart, dateEnd, subject } = data;
    const currentTime = server_utc_time.plus({ hours: 12 });

    const schedule = await Schedule.findOne({
      _id: scheduleId,
      status: "available",
      "dateTime.start": { $gte: currentTime },
    }).exec();
    if (!schedule) throw new CustomError("Schedule not found", 404);

    const timezone = await get_user_timezone(requestedBy);
    const zoneOpts = { zone: timezone };
    const startUTC = DateTime.fromISO(dateStart, zoneOpts).toUTC().toJSDate();
    const endUTC = DateTime.fromISO(dateEnd, zoneOpts).toUTC().toJSDate();
    await calendarService.check_overlap(requestedBy, startUTC, endUTC);

    const haveRequest = await RequestSchedule.exists({
      requestedBy,
      requestedTo: schedule.owner,
      "schedule.start": startUTC,
    }).exec();

    if (haveRequest) {
      throw new CustomError(
        "A request with the same date, time and user already exists.",
        400
      );
    }

    const request = await new RequestSchedule({
      requestedBy: requestedBy,
      requestedTo: schedule.owner,
      requestorType: type,
      scheduleId: schedule._id,
      subject: subject,
      schedule: {
        start: startUTC,
        end: endUTC,
      },
      description: schedule?.description || "",
    }).save();
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
  const statusMsg = status === "confirmed" ? "confirm" : "reject";

  try {
    session.startTransaction();

    const currentTime = server_utc_time.plus({ hours: 6 });

    let filter = {
      _id: requestId,
      requestedTo: currentUser._id,
      status: "pending",
    };

    if (status === "confirmed") {
      filter["schedule.start"] = { $gte: currentTime };
    }

    const request = await RequestSchedule.findOne(filter)
      .populate({
        path: "requestedBy",
        select: "details.name",
      })
      .populate({
        path: "requestedTo",
        select: "details.name",
      })
      .session(session)
      .exec();

    if (!request)
      throw new CustomError(
        "Request not found or already cancelled/ended.",
        400
      );

    const dateStart = request.schedule.start;
    const dateEnd = request.schedule.end;

    if (status === "confirm") {
      await scheduleService.check_for_overlap_schedules(
        currentUser._id,
        request.requestedBy._id,
        dateStart,
        dateEnd,
        session
      );
    }

    const updates = { $set: { status: status } };
    filter.updatedAt = request.updatedAt;
    const options = { new: true };

    const updated = await RequestSchedule.findOneAndUpdate(
      filter,
      updates,
      options
    )
      .populate({
        path: "requestedBy",
        select: "display_image details.name.fullname",
      })
      .session(session)
      .exec();

    if (!updated)
      throw new CustomError(
        `Failed to ${statusMsg} the request. Please check if it has not been rejected or canceled yet.`,
        500
      );

    let classroom;

    if (status === "confirmed") {
      const tcher =
        currentUser.role === teacher ? currentUser._id : request.requestedBy;
      const stdnt =
        currentUser.role === student ? currentUser._id : request.requestedBy;

      const { classroom: classroomData, success: classroomSuccess } =
        await classroomService.create_classroom(
          tcher,
          stdnt,
          {
            start: dateStart,
            end: dateEnd,
            description: request?.description || "",
            subjects: request.subject,
          },
          session
        );

      if (!classroomSuccess)
        throw new CustomError(
          "Failed to confirm the schedule. Please try again.",
          500
        );

      classroom = classroomData;

      const updatedSched = await Schedule.findOneAndUpdate(
        { _id: request?.scheduleId, status: "available" },
        {
          $set: {
            classroom: classroomData._id,
            subject: request.subject,
          },
        },
        { new: true }
      )
        .session(session)
        .exec();

      if (!updatedSched) {
        throw new CustomError(
          "Please check if the schedule you would like to confirm is still available.",
          400
        );
      }

      const { success: calendarSuccess } =
        await calendarService.create_requested_class_calendar(
          [currentUser._id, request.requestedBy],
          classroom.startTime,
          classroom.endTime,
          classroom._id,
          session
        );

      if (!calendarSuccess)
        throw new CustomError("Failed to create a calendar data", 500);
    }

    await create_request_schedule_notif(
      {
        initiator: currentUser._id,
        requestSchedId: request._id,
        requestor: request.requestedBy?._id,
        requestorName: request.requestedTo?.details?.name?.fullname,
        status: status,
      },
      session
    );

    await session.commitTransaction();

    return {
      success: true,
      request:
        status === "confirmed"
          ? {
              ...updated._doc,
              schedule: {
                ...updated._doc.schedule._doc,
                classroom: classroom._id,
              },
            }
          : updated,
    };
  } catch (error) {
    await session.abortTransaction();
    throw new CustomError(
      error.message || `Failed to ${statusMsg} the request`,
      error.statusCode || 500
    );
  } finally {
    session.endSession();
  }
};
