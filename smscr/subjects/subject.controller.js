import { stringEscape } from "../../utils/escape-string.js";
import getToken from "../../utils/get-token.js";
import { validatePaginationParams } from "../../utils/validate-pagination-params.js";
import * as SubjectService from "./subject.service.js";

export const getSubjects = async (req, res, next) => {
  try {
    const page = req.query.page;
    const limit = req.query.limit;
    const search = req.query.search || "";
    const { validatedLimit, validatedOffset, validatedPage } =
      validatePaginationParams(limit, page);
    const result = await SubjectService.get_subjects(
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

export const createSubject = async (req, res, next) => {
  try {
    const token = getToken(req);
    const result = await SubjectService.create_subject(token, req.body);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateSubject = async (req, res, next) => {
  try {
    const token = getToken(req);
    const { id } = req.params;
    const result = await SubjectService.update_subject(token, id, req.body);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const deleteSubject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const token = getToken(req);
    const result = await SubjectService.delete_subject(token, id);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
