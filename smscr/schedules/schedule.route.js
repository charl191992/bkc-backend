import express from "express";
import * as scheduleController from "../schedules/schedule.controller.js";
import * as scheduleRequestController from "../schedules/request/schedule-request.controller.js";
import verifyToken from "../../middlewares/token-verification.js";
import validateData from "../../validators/validate-data.js";
import isAuthorized from "../../middlewares/authorized.js";
import { student, suAdmin, teacher } from "../../utils/roles.js";
import createScheduleRules from "../../validators/schedule/create.js";
import updateScheduleRules from "../../validators/schedule/update.js";
import checkIdScheduleRules from "../../validators/schedule/check-id.js";
import createRequestScheduleRules from "../../validators/schedule/request/create.js";

const scheduleRoutes = express.Router();

scheduleRoutes
  .get(
    "/own/available",
    verifyToken,
    isAuthorized([student, teacher, suAdmin]),
    scheduleController.getOwnClassSchedules
  )
  .get(
    "/teacher/available",
    verifyToken,
    isAuthorized([student, suAdmin]),
    scheduleController.getTeacherAvailableClasses
  )
  .get(
    "/student/available",
    verifyToken,
    isAuthorized([teacher, suAdmin]),
    scheduleController.getStudentAvailableClasses
  )
  .get(
    "/requests",
    verifyToken,
    isAuthorized([student, teacher, suAdmin]),
    scheduleRequestController.getOwnRequestedSchedules
  )
  .get(
    "/teacher/requests",
    verifyToken,
    isAuthorized([student, suAdmin]),
    scheduleRequestController.getTeacherScheduleRequests
  )
  .get(
    "/student/requests",
    verifyToken,
    isAuthorized([teacher, suAdmin]),
    scheduleRequestController.getStudentScheduleRequests
  )
  .post(
    "/own/available",
    verifyToken,
    isAuthorized([student, teacher, suAdmin]),
    createScheduleRules,
    validateData,
    scheduleController.createOwnClassSchedule
  )
  .post(
    "/teacher/request",
    verifyToken,
    isAuthorized([teacher, suAdmin]),
    createRequestScheduleRules,
    validateData,
    scheduleRequestController.createTeacherScheduleRequest
  )
  .post(
    "/student/request",
    verifyToken,
    isAuthorized([student, suAdmin]),
    createRequestScheduleRules,
    validateData,
    scheduleRequestController.createStudentScheduleRequest
  )
  .put(
    "/own/available/:id",
    verifyToken,
    isAuthorized([student, teacher, suAdmin]),
    updateScheduleRules,
    validateData,
    scheduleController.updateOwnClassSchedule
  )
  .delete(
    "/own/available/:id",
    verifyToken,
    isAuthorized([student, teacher, suAdmin]),
    checkIdScheduleRules,
    validateData,
    scheduleController.deleteOwnClassSchedule
  );

export default scheduleRoutes;
