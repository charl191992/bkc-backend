import express from "express";
import * as ApplicationController from "./application.controller.js";
import requestApplicationRules from "../../validators/application/request.js";
import validateData from "../../validators/validate-data.js";
import isAuthorized from "../../middlewares/authorized.js";
import { suAdmin, teAdmin } from "../../utils/roles.js";
import verifyToken from "../../middlewares/token-verification.js";
import changeApplicationStatusRules from "../../validators/application/status.js";

const applicationRoutes = express.Router();

applicationRoutes
  .post("/", requestApplicationRules, validateData, ApplicationController.sendApplication)
  .put("/:id/approve", verifyToken, isAuthorized([suAdmin, teAdmin]), changeApplicationStatusRules, validateData, ApplicationController.approveApplication)
  .put("/:id/reject", verifyToken, isAuthorized([suAdmin, teAdmin]), changeApplicationStatusRules, validateData, ApplicationController.rejectApplication)
  .get("/", verifyToken, isAuthorized([suAdmin, teAdmin]), ApplicationController.getApplications);

export default applicationRoutes;
