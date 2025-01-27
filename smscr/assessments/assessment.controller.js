import { stringEscape } from "../../utils/escape-string.js";
import { validatePaginationParams } from "../../utils/validate-pagination-params.js";
import * as AssessmentService from "./assessment.service.js";

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

export const changeAssessmentQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await AssessmentService.change_assessment_question(
      id,
      req.file,
      req.assessment.document
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const changeAssessmentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    const result = await AssessmentService.change_assessment_status(id, status);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const deleteAssessment = async (req, res, next) => {
  try {
    const { status, document } = req.assessment;
    const { id } = req.params;

    let result;

    if (status === "draft") {
      result = await AssessmentService.delete_assessment(id, document);
    }

    if (status === "completed") {
      result = await AssessmentService.temp_delete_assessment(id);
    }

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
