import { DateTime } from "luxon";

const isTimeValid = time => {
  const parsedTime = DateTime.fromFormat(time, "HH:mm");
  return parsedTime.isValid;
};

export default isTimeValid;
