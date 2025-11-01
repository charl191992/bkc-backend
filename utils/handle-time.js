import { DateTime } from "luxon";

const handleTime = (time, userTimezone) => {
  if (!time) return;

  const [hours, minutes] = time.split(":");

  const userDateTime = DateTime.now().setZone(userTimezone).set({ hour: hours, minute: minutes, second: 0, millisecond: 0 });

  const utcDateTime = userDateTime.toUTC();

  return utcDateTime.toFormat("HH:mm");
};

export default handleTime;
