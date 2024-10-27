import express from "express";
import * as authController from "../auth/auth.controller.js";
import loginRules from "../../validators/auth/login.js";
import validateData from "../../validators/validate-data.js";

const authRoutes = express.Router();

authRoutes
  .post("/login", loginRules, validateData, authController.login)
  .post("/logout", authController.logout)
  .get("/status", authController.checkStatus);

export default authRoutes;
