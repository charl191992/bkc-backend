import { stringEscape } from "../../../utils/escape-string.js";
import { validatePaginationParams } from "../../../utils/validate-pagination-params.js";
import * as reqEducLevelService from "./requested-education-level.service.js";

export const getRequestedEducLevels = async (req, res, next) => {
  try {
    const page = req.query.page;
    const limit = req.query.limit;
    const search = req.query.search || "";
    const { validatedLimit, validatedOffset, validatedPage } =
      validatePaginationParams(limit, page);
    const result = await reqEducLevelService.get_requested_educ_levels(
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

export const approveRequestedEducLevels = async (req, res, next) => {};

export const declineRequestedEducLevels = async (req, res, next) => {};
