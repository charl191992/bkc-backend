import express from "express";
import * as scheduleController from "../schedules/schedule.controller.js";
import verifyToken from "../../middlewares/token-verification.js";
import validateData from "../../validators/validate-data.js";
import isAuthorized from "../../middlewares/authorized.js";
import { student, suAdmin, teacher } from "../../utils/roles.js";
import createScheduleRules from "../../validators/schedule/create.js";

const scheduleRoutes = express.Router();

scheduleRoutes.post(
  "/own/available",
  verifyToken,
  isAuthorized([student, teacher, suAdmin]),
  createScheduleRules,
  validateData,
  scheduleController.createOwnClassSchedule
);

export default scheduleRoutes;
