import { stringEscape } from "../../utils/escape-string.js";
import { stAdmin, teAdmin } from "../../utils/roles.js";
import { validatePaginationParams } from "../../utils/validate-pagination-params.js";
import * as UserService from "./user.service.js";

export const createAdmin = async (req, res, next) => {
  try {
    const result = await UserService.create_admin(req.body);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getStudentAdmins = async (req, res, next) => {
  try {
    const page = req.query.page;
    const limit = req.query.limit;
    const search = req.query.search || "";
    const { validatedLimit, validatedOffset, validatedPage } =
      validatePaginationParams(limit, page);

    const result = await UserService.get_admins_by_role(
      stAdmin,
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

export const getTeacherAdmins = async (req, res, next) => {
  try {
    const page = req.query.page;
    const limit = req.query.limit;
    const search = req.query.search || "";
    const { validatedLimit, validatedOffset, validatedPage } =
      validatePaginationParams(limit, page);

    const result = await UserService.get_admins_by_role(
      teAdmin,
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

export const activateUser = async (req, res, next) => {
  try {
    const result = await UserService.change_user_status(
      req.params.id,
      "active"
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const deactivateUser = async (req, res, next) => {
  try {
    const result = await UserService.change_user_status(
      req.params.id,
      "inactive"
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
