import { DateTime } from "luxon";

const default_timezone = "Asia/Manila";

export const setFutureDateTime = (days = 0) => {
  if (isNaN(days)) days = 0;
  return DateTime.now()
    .setZone(default_timezone)
    .plus({ days: days })
    .toJSDate();
};

export const currentDateTime = () =>
  DateTime().now().setZone(default_timezone).toJSDate();

export const convertToUTC = (date, timezone) =>
  DateTime.fromISO(date, { zone: timezone }).toUTC().toJSDate();
