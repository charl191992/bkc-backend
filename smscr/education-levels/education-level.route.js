import express from "express";
import * as EducationLevelController from "./education-level.controller.js";
import isAuthorized from "../../middlewares/authorized.js";
import { suAdmin } from "../../utils/roles.js";
import verifyToken from "../../middlewares/token-verification.js";
import validateData from "../../validators/validate-data.js";
import createLevelRules from "../../validators/levels/create.js";
import updateLevelRules from "../../validators/levels/update.js";
import checkLevelIdRules from "../../validators/levels/delete.js";

const educationLevelRoutes = express.Router();

educationLevelRoutes
  .post(
    "/",
    verifyToken,
    isAuthorized([suAdmin]),
    createLevelRules,
    validateData,
    EducationLevelController.createLevel
  )
  .put(
    "/:id",
    verifyToken,
    isAuthorized([suAdmin]),
    updateLevelRules,
    validateData,
    EducationLevelController.updateLevel
  )
  .get(
    "/",
    verifyToken,
    isAuthorized([suAdmin]),
    EducationLevelController.getLevels
  )
  .delete(
    "/:id",
    verifyToken,
    isAuthorized([suAdmin]),
    checkLevelIdRules,
    validateData,
    EducationLevelController.deleteLevel
  );

export default educationLevelRoutes;
