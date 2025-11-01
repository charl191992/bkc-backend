import getToken from "../../utils/get-token.js";
import { student, teacher } from "../../utils/roles.js";
import { validatePaginationParams } from "../../utils/validate-pagination-params.js";
import * as ScheduleService from "./schedule.service.js";

export const getOwnClassSchedules = async (req, res, next) => {
  try {
    const token = getToken(req);
    const page = req.query.page;
    const limit = req.query.limit;
    const { validatedLimit, validatedOffset, validatedPage } =
      validatePaginationParams(limit, page);
    const result = await ScheduleService.get_own_class_schedule(
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

export const getTeacherAvailableClasses = async (req, res, next) => {
  try {
    const token = getToken(req);
    const page = req.query.page;
    const limit = req.query.limit;
    const { validatedLimit, validatedOffset, validatedPage } =
      validatePaginationParams(limit, page);
    const result = await ScheduleService.get_class_schedule_by_user_type(
      token._id,
      "teacher",
      validatedLimit,
      validatedOffset,
      validatedPage
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getStudentAvailableClasses = async (req, res, next) => {
  try {
    const token = getToken(req);
    const page = req.query.page;
    const limit = req.query.limit;
    const { validatedLimit, validatedOffset, validatedPage } =
      validatePaginationParams(limit, page);
    const result = await ScheduleService.get_class_schedule_by_user_type(
      token._id,
      "student",
      validatedLimit,
      validatedOffset,
      validatedPage
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const createOwnClassSchedule = async (req, res, next) => {
  try {
    const token = getToken(req);
    const result = await ScheduleService.create_available_class_schedule(
      token,
      req.body,
      token.role === student ? "student" : token.role === teacher && "teacher"
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateOwnClassSchedule = async (req, res, next) => {
  try {
    const token = getToken(req);
    const { id } = req.params;
    const result = await ScheduleService.update_available_class_schedule(
      id,
      token,
      req.body
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const deleteOwnClassSchedule = async (req, res, next) => {
  try {
    const token = getToken(req);
    const { id } = req.params;
    const result = await ScheduleService.delete_own_class_schedule(
      id,
      token._id
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
