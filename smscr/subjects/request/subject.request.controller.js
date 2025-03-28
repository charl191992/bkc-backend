import { stringEscape } from "../../../utils/escape-string.js";
import { validatePaginationParams } from "../../../utils/validate-pagination-params.js";
import * as reqSubjectService from "./subject.request.service.js";

export const getRequestedSubjects = async (req, res, next) => {
  try {
    const page = req.query.page;
    const limit = req.query.limit;
    const search = req.query.search || "";
    const { validatedLimit, validatedOffset, validatedPage } =
      validatePaginationParams(limit, page);
    const result = await reqSubjectService.get_requested_subjects(
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
