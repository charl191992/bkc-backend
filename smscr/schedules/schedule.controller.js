import getToken from "../../utils/get-token.js";
import * as schedService from "./schedule.service.js";

export const createSchedule = async (req, res, next) => {
  try {
    const token = getToken(req);
    const result = await schedService.create_schedule(req.body, token);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
