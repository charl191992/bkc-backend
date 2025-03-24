import { DateTime } from "luxon";

export const server_time = DateTime.now();

export const server_utc_time = server_time.toUTC();
