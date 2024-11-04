import { DateTime } from "luxon";

export const toDefaultTimezone = date =>
  DateTime.fromJSDate(date).setZone("Asia/Manila");
