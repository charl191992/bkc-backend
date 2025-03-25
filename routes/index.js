import applicationRoutes from "../smscr/applications/application.route.js";
import assessmentRoutes from "../smscr/assessments/assessment.route.js";
import authRoutes from "../smscr/auth/auth.route.js";
import countryRoutes from "../smscr/countries/country.route.js";
import enrollmentRoutes from "../smscr/enrollments/enrollment.routes.js";
import interviewRoutes from "../smscr/interviews/interview.route.js";
import levelRoutes from "../smscr/levels/level.route.js";
import optionRoutes from "../smscr/options/options.route.js";
import scheduleRoutes from "../smscr/schedules/schedule.route.js";
import subjectRoutes from "../smscr/subjects/subject.route.js";
import userRoutes from "../smscr/users/user.route.js";
import notificationRoutes from "../smscr/notifications/notification.route.js";
import calendarRoutes from "../smscr/calendars/calendar.route.js";

const routers = app => {
  app.use("/api/v1/application", applicationRoutes);
  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/user", userRoutes);
  app.use("/api/v1/interview", interviewRoutes);
  app.use("/api/v1/level", levelRoutes);
  app.use("/api/v1/subject", subjectRoutes);
  app.use("/api/v1/country", countryRoutes);
  app.use("/api/v1/option", optionRoutes);
  app.use("/api/v1/assessment", assessmentRoutes);
  app.use("/api/v1/enrollment", enrollmentRoutes);
  app.use("/api/v1/schedule", scheduleRoutes);
  app.use("/api/v1/notification", notificationRoutes);
  app.use("/api/v1/calendar", calendarRoutes);
};

export default routers;
