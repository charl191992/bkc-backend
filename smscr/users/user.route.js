import express from "express";
import * as UserController from "./user.controller.js";
import validateData from "../../validators/validate-data.js";
import createAdminRules from "../../validators/admins/create.js";
import isAuthorized from "../../middlewares/authorized.js";
import { suAdmin } from "../../utils/roles.js";
import userChangeStatusRules from "../../validators/users/change-status.js";
import verifyToken from "../../middlewares/token-verification.js";

const userRoutes = express.Router();

userRoutes
  .post(
    "/create-account",
    verifyToken,
    isAuthorized([suAdmin]),
    createAdminRules,
    validateData,
    UserController.createAdmin
  )
  .put(
    "/status/activate/:id",
    verifyToken,
    isAuthorized([suAdmin]),
    userChangeStatusRules,
    validateData,
    UserController.activateUser
  )
  .put(
    "/status/deactivate/:id",
    verifyToken,
    isAuthorized([suAdmin]),
    userChangeStatusRules,
    validateData,
    UserController.deactivateUser
  )
  .get(
    "/students",
    verifyToken,
    isAuthorized([suAdmin]),
    UserController.getStudents
  )
  .get(
    "/educators",
    verifyToken,
    isAuthorized([suAdmin]),
    UserController.getEducators
  )
  .get(
    "/student-admins",
    verifyToken,
    isAuthorized([suAdmin]),
    UserController.getStudentAdmins
  )
  .get(
    "/teacher-admins",
    verifyToken,
    isAuthorized([suAdmin]),
    UserController.getTeacherAdmins
  );

export default userRoutes;
