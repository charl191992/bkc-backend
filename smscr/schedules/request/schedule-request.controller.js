import isIdValid from "../../../utils/check-id.js";
import CustomError from "../../../utils/custom-error.js";
import getToken from "../../../utils/get-token.js";
import { validatePaginationParams } from "../../../utils/validate-pagination-params.js";
import * as scheduleRequestService from "./schedule-request.service.js";

export const getOwnRequestedSchedules = async (req, res, next) => {
  try {
    const token = getToken(req);
    const page = req.query.page;
    const limit = req.query.limit;
    const { validatedLimit, validatedOffset, validatedPage } =
      validatePaginationParams(limit, page);

    const result = await scheduleRequestService.get_own_request_by_type(
      token._id,
      validatedLimit,
      validatedOffset,
      validatedPage
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getTeacherScheduleRequests = async (req, res, next) => {
  try {
    const token = getToken(req);
    const page = req.query.page;
    const limit = req.query.limit;
    const { validatedLimit, validatedOffset, validatedPage } =
      validatePaginationParams(limit, page);

    const result = await scheduleRequestService.get_requesteds_by_type(
      token._id,
      validatedLimit,
      validatedOffset,
      validatedPage,
      "teacher"
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getStudentScheduleRequests = async (req, res, next) => {
  try {
    const token = getToken(req);
    const page = req.query.page;
    const limit = req.query.limit;
    const { validatedLimit, validatedOffset, validatedPage } =
      validatePaginationParams(limit, page);

    const result = await scheduleRequestService.get_requesteds_by_type(
      token._id,
      validatedLimit,
      validatedOffset,
      validatedPage,
      "student"
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const createStudentScheduleRequest = async (req, res, next) => {
  try {
    const token = getToken(req);
    const result = await scheduleRequestService.create_request_by_type(
      token._id,
      req.body,
      "student"
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const createTeacherScheduleRequest = async (req, res, next) => {
  try {
    const token = getToken(req);
    const result = await scheduleRequestService.create_request_by_type(
      token._id,
      req.body,
      "teacher"
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const cancelOwnRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isIdValid(id)) throw new CustomError("Invalid schedule request id");
    const token = getToken(req);
    const result = await scheduleRequestService.cancel_own_request(
      token._id,
      id
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const confirmRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isIdValid(id)) throw new CustomError("Invalid schedule request id");
    const token = getToken(req);
    const result =
      await scheduleRequestService.approval_rejection_of_request_by_type(
        token,
        id,
        "confirm"
      );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const rejectRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isIdValid(id)) throw new CustomError("Invalid schedule request id");
    const token = getToken(req);
    const result =
      await scheduleRequestService.approval_rejection_of_request_by_type(
        token,
        id,
        "reject"
      );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
