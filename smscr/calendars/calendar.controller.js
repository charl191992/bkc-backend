import { DateTime } from "luxon";
import { get_user_timezone } from "../../utils/get-timezone.js";
import getToken from "../../utils/get-token.js";
import * as calendarService from "./calendar.service.js";

export const getCalendars = async (req, res, next) => {
  try {
    const token = getToken(req);
    let timezone;
    let start = req.query.start;
    let end = req.query.end;

    const firstDayUTC = DateTime.utc().startOf("month");
    const lastDayUTC = DateTime.utc().endOf("month");

    if (!start || !end) timezone = await get_user_timezone(token._id);
    if (!start) start = firstDayUTC.setZone(timezone).toISO();
    if (!end) end = lastDayUTC.setZone(timezone).toISO();

    const result = await calendarService.get_calendar_schedules(
      token,
      start,
      end
    );

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
