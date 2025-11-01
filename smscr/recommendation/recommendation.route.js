import express from "express";
import * as recommendationCtrl from "./recommendation.controller.js";
import validateData from "../../validators/validate-data.js";
import verifyToken from "../../middlewares/token-verification.js";
import isAuthorized from "../../middlewares/authorized.js";
import { stAdmin, suAdmin, teAdmin } from "../../utils/roles.js";
import { recommendationRules } from "./recommendation.validation.js";

const recommendationRoutes = express.Router();

recommendationRoutes.post("/", verifyToken, isAuthorized([stAdmin, teAdmin, suAdmin]), recommendationRules, validateData, recommendationCtrl.sendRecommendation);
export default recommendationRoutes;
