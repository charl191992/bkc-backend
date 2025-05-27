import CustomError from "../../../utils/custom-error.js";
import Enrollment from "../../enrollments/enrollment.schema.js";
import Assessment from "../assessment.schema.js";
import StudentAssessment from "./student-assessment.schema.js";
import * as studentAssessmentService from "./student-assessment.service.js";

export const getAssessmentsByIds = async (req, res, next) => {
  try {
    const result = await studentAssessmentService.get_assessments_by_enrollment(req.params.id);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const sendAssessment = async (req, res, next) => {
  try {
    const { assessment, enrollment } = req.body;

    const assessmentExistsPromise = Assessment.exists({ _id: assessment, status: "completed" });
    const enrollmentExistsPromise = Enrollment.exists({ _id: enrollment });
    const assessmentSentExistsPromise = StudentAssessment.exists({ assessment: assessment, enrollment: enrollment });

    const [assessmentExists, enrollmentExists, assessmentSent] = await Promise.all([assessmentExistsPromise, enrollmentExistsPromise, assessmentSentExistsPromise]);

    if (!assessmentExists) {
      throw new CustomError("Assessment does not exists / not yet completed.", 404);
    }

    if (!enrollmentExists) {
      throw new CustomError("Enrollment not found", 404);
    }

    if (assessmentSent) {
      throw new CustomError("This assessment has already been sent to this enrollee.", 404);
    }

    const result = await studentAssessmentService.send_assessment(req.body);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const takeAssessment = async (req, res, next) => {
  try {
    const result = await studentAssessmentService.take_assessment(req.body);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const setAnswer = async (req, res, next) => {
  try {
    const result = await studentAssessmentService.add_answer(req.body);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const submitAssessment = async (req, res, next) => {
  try {
    const result = await studentAssessmentService.submit_assessment(req.body);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
