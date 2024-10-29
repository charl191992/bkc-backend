import express from "express";
import * as UserController from "./user.controller.js";
import validateData from "../../validators/validate-data.js";
import createAdminRules from "../../validators/admins/create.js";
import isAuthorized from "../../middlewares/authorized.js";
import { suAdmin } from "../../utils/roles.js";
import userChangeStatusRules from "../../validators/users/change-status.js";

const userRoutes = express.Router();

userRoutes
  .post(
    "/create-account",
    isAuthorized([suAdmin]),
    createAdminRules,
    validateData,
    UserController.createAdmin
  )
  .put(
    "/status/activate/:id",
    isAuthorized([suAdmin]),
    userChangeStatusRules,
    validateData,
    UserController.activateUser
  )
  .put(
    "/status/deactivate/:id",
    isAuthorized([suAdmin]),
    userChangeStatusRules,
    validateData,
    UserController.deactivateUser
  )
  .get(
    "/student-admins",
    isAuthorized([suAdmin]),
    UserController.getStudentAdmins
  )
  .get(
    "/teacher-admins",
    isAuthorized([suAdmin]),
    UserController.getTeacherAdmins
  );

export default userRoutes;
