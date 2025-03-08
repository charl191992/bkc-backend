import getToken from "../../../utils/get-token.js";
import * as scheduleRequestService from "./schedule-request.service.js";

export const createStudentScheduleRequest = async (req, res, next) => {
  try {
    const token = getToken(req);
    const result = await scheduleRequestService.create_request_by_type(
      token._id,
      req.body,
      "student"
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const createTeacherScheduleRequest = async (req, res, next) => {
  try {
    const token = getToken(req);
    const result = await scheduleRequestService.create_request_by_type(
      token._id,
      req.body,
      "teacher"
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
