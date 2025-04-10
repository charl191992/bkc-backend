import { stringEscape } from "../../utils/escape-string.js";
import { validatePaginationParams } from "../../utils/validate-pagination-params.js";
import * as AssessmentService from "./assessment.service.js";
import * as EnrollmentService from "../enrollments/enrollment.service.js";
import * as StudentAssessmentService from "./students/student-assessment.service.js";
import isIdValid from "../../utils/check-id.js";
import CustomError from "../../utils/custom-error.js";
import Assessment from "./assessment.schema.js";
import AssessmentQuestion from "./questions/assessment.question.schema.js";
import getToken from "../../utils/get-token.js";

export const getAssessments = async (req, res, next) => {
  try {
    const page = req.query.page;
    const limit = req.query.limit;
    const search = req.query.search || "";
    const { validatedLimit, validatedOffset, validatedPage } =
      validatePaginationParams(limit, page);
    const result = await AssessmentService.get_assessments(
      validatedLimit,
      validatedOffset,
      validatedPage,
      stringEscape(search)
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getAssessmentByEnrollmentId = async (req, res, next) => {
  try {
    if (!isIdValid(req.params.id))
      throw new CustomError("Invalid enrollment id", 400);

    const data = await EnrollmentService.get_enrollment_by_id(req.params.id);
    const enrollment = data.enrollment;
    const country = enrollment?.studentDetails.address.country._id;
    const level = enrollment?.education.grade_level._id;
    const subjects = enrollment?.subjects.map(subject => subject.value);

    const result = await AssessmentService.get_assessment_by_country_and_level(
      country,
      level,
      subjects
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getAssessmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await AssessmentService.get_assessment_by_id(id);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const createAssessment = async (req, res, next) => {
  try {
    const result = await AssessmentService.create_assessment(
      req.body,
      req.file
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const sendAssessments = async (req, res, next) => {
  try {
    const result = await StudentAssessmentService.send_assessment(req.body);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateAssessmentDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await AssessmentService.update_assessment_details(
      id,
      req.body
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const markAssessmentAsCompleted = async (req, res, next) => {
  try {
    const assessment = await Assessment.findOne({
      _id: req.params.id,
      status: "draft",
    }).exec();
    if (!assessment) {
      throw new CustomError("Assessment not found / already completed.", 400);
    }

    if (assessment.type === "multiple choice") {
      const noChoices = await AssessmentQuestion.exists({
        assessment: req.params.id,
        choices: { $size: 0 },
      });
      if (noChoices) {
        throw new CustomError(
          "A question in the assessment does not have a choices.",
          400
        );
      }
    }

    const noAnswer = await AssessmentQuestion.exists({
      assessment: req.params.id,
      $or: [{ answer: { $exists: false } }, { answer: "" }, { answer: null }],
    });
    if (noAnswer) {
      throw new CustomError(
        "A question in the assessment does not have a answer.",
        400
      );
    }

    const result = await AssessmentService.change_assessment_status(
      req.params.id,
      "completed"
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const markAssessmentAsDraft = async (req, res, next) => {
  try {
    await AssessmentService.assessment_exists(req.params.id);
    const result = await AssessmentService.change_assessment_status(
      req.params.id,
      "draft"
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const deleteAssessment = async (req, res, next) => {
  try {
    const token = getToken(req);
    const { id } = req.params;
    let result = await AssessmentService.delete_assessment(id, token);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
