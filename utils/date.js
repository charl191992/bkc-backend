import { DateTime } from "luxon";

export const timePattern = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;

export const toDefaultTimezone = date =>
  DateTime.fromJSDate(date).setZone("Asia/Manila");

export const convertToDate = (date, time) => {
  const [hours, minutes] = time.split(":").map(Number);
  const dateTime = DateTime.fromJSDate(date).set({
    hour: hours,
    minute: minutes,
  });
  return new Date(dateTime);
};
