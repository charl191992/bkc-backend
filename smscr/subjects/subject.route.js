import express from "express";
import * as SubjectController from "./subject.controller.js";
import * as ReqSubjectController from "./request/subject.request.controller.js";
import isAuthorized from "../../middlewares/authorized.js";
import { suAdmin } from "../../utils/roles.js";
import verifyToken from "../../middlewares/token-verification.js";
import createSubjectRules from "../../validators/subjects/create.js";
import validateData from "../../validators/validate-data.js";
import updateSubjectRules from "../../validators/subjects/update.js";
import checkSubjectIdRules from "../../validators/subjects/delete.js";

const subjectRoutes = express.Router();

subjectRoutes
  .post("/", verifyToken, isAuthorized([suAdmin]), createSubjectRules, validateData, SubjectController.createSubject)
  .put("/:id", verifyToken, isAuthorized([suAdmin]), updateSubjectRules, validateData, SubjectController.updateSubject)
  .get("/", verifyToken, isAuthorized([suAdmin]), SubjectController.getSubjects)
  .get("/requested", verifyToken, isAuthorized([suAdmin]), ReqSubjectController.getRequestedSubjects)
  .delete("/:id", verifyToken, isAuthorized([suAdmin]), checkSubjectIdRules, validateData, SubjectController.deleteSubject);

export default subjectRoutes;
