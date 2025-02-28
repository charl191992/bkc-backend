import isIdValid from "../../utils/check-id.js";
import CustomError from "../../utils/custom-error.js";
import { stringEscape } from "../../utils/escape-string.js";
import { validatePaginationParams } from "../../utils/validate-pagination-params.js";
import * as EnrollmentService from "./enrollment.service.js";

export const studentEnroll = async (req, res, next) => {
  try {
    let errors = [];

    if (!req.files?.display_image) {
      errors.push({
        path: "display_image",
        msgs: ["Display Image is required"],
      });
    }

    if (!req.files?.report_card) {
      errors.push({
        path: "report_card",
        msgs: ["Report Card is required"],
      });
    }

    if (!req.files?.proof_of_payment) {
      errors.push({
        path: "proof_of_payment",
        msgs: ["Proof of Payment is required"],
      });
    }

    if (errors.length > 0) throw new CustomError("Invalid image", 400, errors);

    const result = await EnrollmentService.create_enrollment(
      req.body,
      req.files
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getEnrollments = async (req, res, next) => {
  try {
    const page = req.query.page;
    const limit = req.query.limit;
    const search = req.query.search || "";
    const { validatedLimit, validatedOffset, validatedPage } =
      validatePaginationParams(limit, page);
    const result = await EnrollmentService.get_enrollments(
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

export const getEnrollmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isIdValid(id)) throw new CustomError("Invalid enrollment id", 400);
    const result = await EnrollmentService.get_enrollment_by_id(id);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const rejectEnrollment = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isIdValid(id)) throw new CustomError("Invalid enrollment id", 400);
    const result = await EnrollmentService.change_enrollment_status(
      id,
      "rejected"
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const approveEnrollment = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isIdValid(id)) throw new CustomError("Invalid enrollment id", 400);
    const result = await EnrollmentService.change_enrollment_status(
      id,
      "approved"
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const enrollmentSubjectApproval = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { subjectId } = req.body;
    if (!isIdValid(id)) throw new CustomError("Invalid enrollment id", 400);
    if (!isIdValid(subjectId)) throw new CustomError("Invalid subject id", 400);
    const result = await EnrollmentService.enrollment_subject_approval(
      id,
      subjectId,
      "approve"
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const enrollmentSubjectRejection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { subjectId } = req.body;
    if (!isIdValid(id)) throw new CustomError("Invalid enrollment id", 400);
    if (!isIdValid(subjectId)) throw new CustomError("Invalid subject id", 400);
    const result = await EnrollmentService.enrollment_subject_approval(
      id,
      subjectId,
      "reject"
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
