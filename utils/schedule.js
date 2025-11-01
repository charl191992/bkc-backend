import { DateTime } from "luxon";

export const getNextWednesdayDate = date => {
  const today = DateTime.fromISO(date);
  const thisWeekWednesday = today.set({ weekday: 3 });

  return today.weekday >= 3 ? thisWeekWednesday.plus({ weeks: 1 }).toISODate() : thisWeekWednesday.toISODate();
};

export const getCoveredWednesdayDates = (noOfWeeks, date) => {
  const startDate = DateTime.fromISO(this.getNextWednesdayDate(date));
  const dates = [];
  for (let i = 0; i < noOfWeeks; i++) {
    dates.push(startDate.plus({ weeks: i }).toISODate());
  }
  return dates;
};

export const setPaymentDates = (noOfWeeks, date) => {
  const startDate = DateTime.fromJSDate(new Date(date));
  const nextWednesday = DateTime.fromISO(this.getNextWednesdayDate(startDate));

  return Array.from({ length: noOfWeeks }, (_, i) => ({
    date: nextWednesday.plus({ weeks: i }).toISODate(), // Returns JavaScript Date object
    paid: false,
  }));
};

export const setScheduleDates = data => {
  const { start, end, scheduleId, teacher, students, recommendedDays, time_start, time_end, subjects } = data;
  let start_date = DateTime.fromJSDate(start);
  let end_date = DateTime.fromJSDate(end);

  const scheduleDates = [];

  while (start_date <= end_date) {
    const weekdayName = start_date.weekdayLong.toLocaleLowerCase();

    if (recommendedDays.includes(weekdayName)) {
      scheduleDates.push({
        scheduleDetails: scheduleId,
        date: start_date,
        time_start,
        time_end,
        teacher: teacher,
        students: students,
        subjects: subjects,
        status: "pending",
      });
    }
    start_date = start_date.plus({ days: 1 });
  }

  return scheduleDates;
};
