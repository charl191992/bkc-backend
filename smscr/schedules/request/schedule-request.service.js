import { convertToUTC, currentDateTime } from "../../../helpers/date-time.js";
import CustomError from "../../../utils/custom-error.js";
import UserDetails from "../../user_details/user-details.schema.js";
import Schedule from "../schedule.schema.js";
import RequestSchedule from "./schedule-request.schema.js";

export const create_request_by_type = async (requestedBy, data, type) => {
  try {
    const schedule = await Schedule.findById(data.scheduleId).exec();
    if (!schedule) throw new CustomError("Schedule not found", 404);

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
