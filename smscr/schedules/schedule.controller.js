import getToken from "../../utils/get-token.js";
import * as ScheduleService from "./schedule.service.js";

export const createOwnClassSchedule = async (req, res, next) => {
  try {
    const token = getToken(req);
    const result = await ScheduleService.create_available_class_schedule(
      token._id,
      req.body
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
