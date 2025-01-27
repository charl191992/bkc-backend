import getToken from "../../utils/get-token.js";
import { validatePaginationParams } from "../../utils/validate-pagination-params.js";
import Interview from "./interview.schema.js";
import * as InterviewService from "./interview.service.js";

export const createInterview = async (req, res, next) => {
  try {
    const token = getToken(req);
    const result = await InterviewService.schedule_meeting(req.body, token._id);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateInterview = async (req, res, next) => {
  try {
    const id = req.params.id;
    const result = await InterviewService.update_schedule(id, req.body);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getInterviews = async (req, res, next) => {
  try {
    const page = req.query.page;
    const limit = req.query.limit;
    const { validatedLimit, validatedOffset, validatedPage } =
      validatePaginationParams(limit, page);

    const result = await InterviewService.get_incoming_interviews(
      validatedLimit,
      validatedOffset,
      validatedPage
    );

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
