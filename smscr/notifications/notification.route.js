import express from "express";
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
import * as notifRecipientController from "./recipients/notification-recipient.controller.js";

const subjectRoutes = express.Router();

subjectRoutes
  .get(
    "/",
    verifyToken,
    isAuthorized([student, teacher, principal, stAdmin, teAdmin, suAdmin]),
    notifRecipientController.getNotifications
  )
  .patch(
    "/mark-read/:id",
    verifyToken,
    isAuthorized([student, teacher, principal, stAdmin, teAdmin, suAdmin]),
    notifRecipientController.markAsRead
  )
  .patch(
    "/mark-all/read",
    verifyToken,
    isAuthorized([student, teacher, principal, stAdmin, teAdmin, suAdmin]),
    notifRecipientController.markAllAsRead
  );

export default subjectRoutes;
