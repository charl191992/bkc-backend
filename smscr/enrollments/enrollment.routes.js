import express from "express";
import * as enrollmentController from "./enrollment.controller.js";
import enrollmentUploadCheck from "./enrollment.upload.js";
import enrollmentRules from "../../validators/enrollments/create.js";
import validateData from "../../validators/validate-data.js";

const enrollmentRoutes = express.Router();

enrollmentRoutes.post(
  "/",
  enrollmentUploadCheck,
  enrollmentRules,
  validateData,
  enrollmentController.studentEnroll
);

export default enrollmentRoutes;
