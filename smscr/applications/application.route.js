import express from "express";
import * as ApplicationController from "./application.controller.js";
import requestApplicationRules from "../../validators/application/request.js";
import validateData from "../../validators/validate-data.js";

const applicationRoutes = express.Router();

applicationRoutes.post(
  "/",
  requestApplicationRules,
  validateData,
  ApplicationController.sendApplication
);

export default applicationRoutes;
