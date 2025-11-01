import { DateTime } from "luxon";
import getToken from "../../utils/get-token.js";
import * as scheduleDateService from "./schedule-date.service.js";

export const getOwnSchedule = async (req, res, next) => {
  try {
    const { start, end } = req.query;
    const token = getToken(req);
    const result = await scheduleDateService.get_own_schedule(token, start, end);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
