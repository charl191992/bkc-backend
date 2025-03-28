import { stringEscape } from "../../utils/escape-string.js";
import getToken from "../../utils/get-token.js";
import { validatePaginationParams } from "../../utils/validate-pagination-params.js";
import * as EducationLevelService from "./education-level.service.js";

export const getLevels = async (req, res, next) => {
  try {
    const page = req.query.page;
    const limit = req.query.limit;
    const search = req.query.search || "";
    const { validatedLimit, validatedOffset, validatedPage } =
      validatePaginationParams(limit, page);
    const result = await EducationLevelService.get_levels(
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

export const createLevel = async (req, res, next) => {
  try {
    const token = getToken(req);
    const result = await EducationLevelService.create_level(token, req.body);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateLevel = async (req, res, next) => {
  try {
    const token = getToken(req);
    const { id } = req.params;
    const result = await EducationLevelService.update_level(
      token,
      id,
      req.body
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const deleteLevel = async (req, res, next) => {
  try {
    const token = getToken(req);
    const { id } = req.params;
    const result = await EducationLevelService.delete_level(user, id);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
