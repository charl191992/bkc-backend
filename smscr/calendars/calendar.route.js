import express from "express";
import * as calendarController from "./calendar.controller.js";
import isAuthorized from "../../middlewares/authorized.js";
import {
  principal,
  stAdmin,
  student,
  suAdmin,
  teacher,
  teAdmin,
} from "../../utils/roles.js";
import verifyToken from "../../middlewares/token-verification.js";

const calendarRoutes = express.Router();

calendarRoutes.get(
  "/",
  verifyToken,
  isAuthorized([student, teacher, principal, stAdmin, teAdmin, suAdmin]),
  calendarController.getCalendars
);

export default calendarRoutes;
