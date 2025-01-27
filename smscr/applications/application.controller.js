import { stringEscape } from "../../utils/escape-string.js";
import { validatePaginationParams } from "../../utils/validate-pagination-params.js";
import * as ApplicationService from "./application.service.js";

export const sendApplication = async (req, res, next) => {
  try {
    const result = await ApplicationService.createApplication(req.body);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getApplications = async (req, res, next) => {
  try {
    const page = req.query.page;
    const limit = req.query.limit;
    const search = req.query.search || "";
    const { validatedLimit, validatedOffset, validatedPage } =
      validatePaginationParams(limit, page);

    const result = await ApplicationService.get_applications(
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

export const approveApplication = async (req, res, next) => {
  try {
    const id = req.params.id;
    const status = "approved";
    const result = await ApplicationService.change_status(id, status);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const rejectApplication = async (req, res, next) => {
  try {
    const id = req.params.id;
    const status = "rejected";
    const result = await ApplicationService.change_status(id, status);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
