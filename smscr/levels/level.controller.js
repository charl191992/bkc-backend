import { stringEscape } from "../../utils/escape-string.js";
import { validatePaginationParams } from "../../utils/validate-pagination-params.js";
import * as LevelService from "./level.service.js";

export const getLevels = async (req, res, next) => {
  try {
    const page = req.query.page;
    const limit = req.query.limit;
    const search = req.query.search || "";
    const { validatedLimit, validatedOffset, validatedPage } =
      validatePaginationParams(limit, page);
    const result = await LevelService.get_levels(
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
    const result = await LevelService.create_level(req.body);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateLevel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await LevelService.update_level(id, req.body);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const deleteLevel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await LevelService.delete_level(id);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
