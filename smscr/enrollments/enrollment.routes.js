import express from "express";
import * as enrollmentController from "./enrollment.controller.js";
import enrollmentUploadCheck from "./enrollment.upload.js";
import enrollmentRules from "../../validators/enrollments/create.js";
import validateData from "../../validators/validate-data.js";
import verifyToken from "../../middlewares/token-verification.js";
import isAuthorized from "../../middlewares/authorized.js";
import { stAdmin, suAdmin, teAdmin } from "../../utils/roles.js";

const enrollmentRoutes = express.Router();

enrollmentRoutes
  .get(
    "/",
    verifyToken,
    isAuthorized([stAdmin, teAdmin, suAdmin]),
    enrollmentController.getEnrollments
  )
  .get("/:id", verifyToken, enrollmentController.getEnrollmentById)
  .post(
    "/",
    enrollmentUploadCheck,
    enrollmentRules,
    validateData,
    enrollmentController.studentEnroll
  )
  .put(
    "/reject/:id",
    verifyToken,
    isAuthorized([stAdmin, teAdmin, suAdmin]),
    enrollmentController.rejectEnrollment
  )
  .put(
    "/approve/:id",
    verifyToken,
    isAuthorized([stAdmin, teAdmin, suAdmin]),
    enrollmentController.approveEnrollment
  );

export default enrollmentRoutes;
