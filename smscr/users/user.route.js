import express from "express";
import * as UserController from "./user.controller.js";
import validateData from "../../validators/validate-data.js";
import createAdminRules from "../../validators/admins/create.js";
import isAuthorized from "../../middlewares/authorized.js";
import { suAdmin } from "../../utils/roles.js";

const userRoutes = express.Router();

userRoutes.post(
  "/create-account",
  isAuthorized([suAdmin]),
  createAdminRules,
  validateData,
  UserController.createAdmin
);

export default userRoutes;
