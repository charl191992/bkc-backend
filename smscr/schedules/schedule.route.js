import express from "express";
import * as schedCtrl from "./schedule.controller.js";
import * as schedDateCtrl from "../schedule-dates/schedule-date.controller.js";
import verifyToken from "../../middlewares/token-verification.js";
import isAuthorized from "../../middlewares/authorized.js";
import { createScheduleRules } from "./schedule.validation.js";
import validateData from "../../validators/validate-data.js";
import { principal, stAdmin, suAdmin, teacher, teAdmin } from "../../utils/roles.js";

const scheduleRoutes = express.Router();

scheduleRoutes.post("/", verifyToken, isAuthorized([suAdmin]), createScheduleRules, validateData, schedCtrl.createSchedule).get("/own", verifyToken, schedDateCtrl.getOwnSchedule);

export default scheduleRoutes;
