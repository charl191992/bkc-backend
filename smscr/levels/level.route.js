import express from "express";
import * as LevelController from "./level.controller.js";
import isAuthorized from "../../middlewares/authorized.js";
import { suAdmin } from "../../utils/roles.js";
import verifyToken from "../../middlewares/token-verification.js";
import validateData from "../../validators/validate-data.js";
import createLevelRules from "../../validators/levels/create.js";
import updateLevelRules from "../../validators/levels/update.js";
import checkLevelIdRules from "../../validators/levels/delete.js";

const levelRoutes = express.Router();

levelRoutes
  .post(
    "/",
    verifyToken,
    isAuthorized([suAdmin]),
    createLevelRules,
    validateData,
    LevelController.createLevel
  )
  .put(
    "/:id",
    verifyToken,
    isAuthorized([suAdmin]),
    updateLevelRules,
    validateData,
    LevelController.updateLevel
  )
  .get("/", verifyToken, isAuthorized([suAdmin]), LevelController.getLevels)
  .delete(
    "/:id",
    verifyToken,
    isAuthorized([suAdmin]),
    checkLevelIdRules,
    validateData,
    LevelController.deleteLevel
  );

export default levelRoutes;
