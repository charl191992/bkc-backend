import express from "express";
import * as materialCtrl from "./material.controller.js";
import validateData from "../../validators/validate-data.js";
import verifyToken from "../../middlewares/token-verification.js";
import isAuthorized from "../../middlewares/authorized.js";
import { stAdmin, suAdmin, teAdmin } from "../../utils/roles.js";
import { materialIdRules } from "./material.validation.js";
import materialUploadCheck from "./material.upload.js";

const materialRoutes = express.Router();

materialRoutes
  .get("/personal", verifyToken, isAuthorized([stAdmin, teAdmin, suAdmin]), materialCtrl.getPersonalMaterials)
  .get("/global", verifyToken, isAuthorized([stAdmin, teAdmin, suAdmin]), materialCtrl.getGlobalMaterials)
  .get("/personal/:id", verifyToken, isAuthorized([stAdmin, teAdmin, suAdmin]), materialCtrl.getPersonalMaterial)
  .get("/global/:id", verifyToken, isAuthorized([stAdmin, teAdmin, suAdmin]), materialCtrl.getGlobalMaterial)
  .get("/download/:id", verifyToken, isAuthorized([stAdmin, teAdmin, suAdmin]), materialIdRules, validateData, materialCtrl.downloadMaterial)

  .post("/personal", verifyToken, isAuthorized([stAdmin, teAdmin, suAdmin]), materialUploadCheck, materialCtrl.addPersonalMaterial)
  .post("/global", verifyToken, isAuthorized([stAdmin, teAdmin, suAdmin]), materialUploadCheck, materialCtrl.addGlobalMaterial)

  .put("/personal/:id", verifyToken, isAuthorized([stAdmin, teAdmin, suAdmin]), materialIdRules, validateData, materialUploadCheck, materialCtrl.updatePersonalMaterial)
  .put("/global/:id", verifyToken, isAuthorized([stAdmin, teAdmin, suAdmin]), materialIdRules, validateData, materialUploadCheck, materialCtrl.updateGlobalMaterial)

  .delete("/personal/:id", verifyToken, isAuthorized([stAdmin, teAdmin, suAdmin]), materialIdRules, validateData, materialCtrl.deletePersonalMaterial)
  .delete("/global/:id", verifyToken, isAuthorized([stAdmin, teAdmin, suAdmin]), materialIdRules, validateData, materialCtrl.deleteGlobalMaterial);

export default materialRoutes;
