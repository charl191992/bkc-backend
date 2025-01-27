import express from "express";
import * as InterviewController from "./interview.controller.js";
import validateData from "../../validators/validate-data.js";
import isAuthorized from "../../middlewares/authorized.js";
import { suAdmin, teAdmin } from "../../utils/roles.js";
import verifyToken from "../../middlewares/token-verification.js";
import createInterviewRules from "../../validators/interviews/create.js";
import updateInterviewRules from "../../validators/interviews/update.js";

const interviewRoutes = express.Router();

interviewRoutes
  .post(
    "/",
    verifyToken,
    isAuthorized([suAdmin, teAdmin]),
    createInterviewRules,
    validateData,
    InterviewController.createInterview
  )
  .put(
    "/:id",
    verifyToken,
    isAuthorized([suAdmin, teAdmin]),
    updateInterviewRules,
    validateData,
    InterviewController.updateInterview
  )
  .get(
    "/",
    verifyToken,
    isAuthorized([suAdmin, teAdmin]),
    InterviewController.getInterviews
  );

export default interviewRoutes;
