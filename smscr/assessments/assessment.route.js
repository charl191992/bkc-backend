import express from "express";
import * as AssessmentController from "./assessment.controller.js";
import * as AssessmentSectionController from "./sections/assessment.section.controller.js";
import * as AssessmentQuestionController from "./questions/assessment.question.controller.js";
import * as StudentAssessmentController from "./students/student-assessment.controller.js";
import isAuthorized from "../../middlewares/authorized.js";
import { stAdmin, suAdmin, teAdmin } from "../../utils/roles.js";
import verifyToken from "../../middlewares/token-verification.js";
import validateData from "../../validators/validate-data.js";
import createAssessmentRules from "../../validators/assessment/create.js";
import updateAssessmentRules from "../../validators/assessment/update.js";
import assessmentIdRules from "../../validators/assessment/id.js";
import createAssessmentSectionRules from "../../validators/assessment/section/create.js";
import assessmentSectionIdRules from "../../validators/assessment/section/id.js";
import updateAssessmentSectionRules from "../../validators/assessment/section/update.js";
import sendAssessmentRules from "../../validators/assessment/student/send-assessment.js";
import questionUploadCheck from "./questions/assessment.question.upload.js";
import addQuestionRules from "./questions/create-question.validation.js";
import updateQuestionRules from "./questions/update-question.validation.js";
import choiceUploadCheck from "./questions/assessment.choice.upload.js";
import addChoiceRules from "./questions/create-choice.validation.js";
import updateChoiceRules from "./questions/update-choice.validation.js";
import { getAssessmentsRules, setAnswerRules, submitAssessmentRules, takeAssessmentRules } from "./students/student-assessment.validation.js";

const assessmentRoutes = express.Router();

assessmentRoutes
  .get("/", verifyToken, isAuthorized([suAdmin, teAdmin, stAdmin]), AssessmentController.getAssessments)
  .get("/by-enrollment/:id", verifyToken, isAuthorized([suAdmin, teAdmin, stAdmin]), AssessmentController.getAssessmentByEnrollmentId)
  .get("/:id", verifyToken, isAuthorized([suAdmin, teAdmin, stAdmin]), AssessmentController.getAssessmentById)

  .post("/", verifyToken, isAuthorized([suAdmin, teAdmin, stAdmin]), createAssessmentRules, validateData, AssessmentController.createAssessment)
  .post("/send", verifyToken, isAuthorized([suAdmin, teAdmin, stAdmin]), sendAssessmentRules, validateData, StudentAssessmentController.sendAssessment)
  .post("/section", verifyToken, isAuthorized([suAdmin, teAdmin, stAdmin]), createAssessmentSectionRules, validateData, AssessmentSectionController.createAssessmentSection)
  .post("/section/question", verifyToken, isAuthorized([suAdmin, teAdmin, stAdmin]), questionUploadCheck, addQuestionRules, validateData, AssessmentQuestionController.addQuestion)
  .post("/section/question/choice", verifyToken, isAuthorized([suAdmin, teAdmin, stAdmin]), choiceUploadCheck, addChoiceRules, validateData, AssessmentQuestionController.addChoice)
  .put("/details/:id", verifyToken, isAuthorized([suAdmin, teAdmin, stAdmin]), updateAssessmentRules, validateData, AssessmentController.updateAssessmentDetails)
  .put("/section/:id", verifyToken, isAuthorized([suAdmin, teAdmin, stAdmin]), updateAssessmentSectionRules, validateData, AssessmentSectionController.updateAssessmentSection)
  .put(
    "/section/question/:id",
    verifyToken,
    isAuthorized([suAdmin, teAdmin, stAdmin]),
    questionUploadCheck,
    updateQuestionRules,
    validateData,
    AssessmentQuestionController.updateQuestion
  )
  .patch("/status/completed/:id", verifyToken, isAuthorized([suAdmin, teAdmin, stAdmin]), AssessmentController.markAssessmentAsCompleted)
  .patch("/status/draft/:id", verifyToken, isAuthorized([suAdmin, teAdmin, stAdmin]), AssessmentController.markAssessmentAsDraft)
  .patch("/section/question/answer/:id", verifyToken, isAuthorized([suAdmin, teAdmin, stAdmin]), AssessmentQuestionController.setAnAnswer)
  .put(
    "/section/question/choice/:id",
    verifyToken,
    isAuthorized([suAdmin, teAdmin, stAdmin]),
    choiceUploadCheck,
    updateChoiceRules,
    validateData,
    AssessmentQuestionController.updateChoice
  )
  .patch("/section/question/choice/:id", verifyToken, isAuthorized([suAdmin, teAdmin, stAdmin]), AssessmentQuestionController.deleteChoice)
  .delete("/section/:id", verifyToken, isAuthorized([suAdmin, teAdmin, stAdmin]), assessmentSectionIdRules, validateData, AssessmentSectionController.deleteAssessmentSection)
  .delete("/section/question/:id", verifyToken, isAuthorized([suAdmin, teAdmin, stAdmin]), AssessmentQuestionController.deleteQuestion)
  .delete("/:id", verifyToken, isAuthorized([suAdmin, teAdmin, stAdmin]), assessmentIdRules, validateData, AssessmentController.deleteAssessment)
  //
  .get("/student/assessments/:id", verifyToken, isAuthorized([suAdmin, teAdmin, stAdmin]), getAssessmentsRules, validateData, StudentAssessmentController.getAssessmentsByIds)
  .post("/student/take", takeAssessmentRules, validateData, StudentAssessmentController.takeAssessment)
  .post("/student/submit", submitAssessmentRules, validateData, StudentAssessmentController.submitAssessment)
  .patch("/student/take/answer", setAnswerRules, validateData, StudentAssessmentController.setAnswer);
export default assessmentRoutes;
