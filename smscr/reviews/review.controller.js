import { stringEscape } from "../../utils/escape-string.js";
import getToken from "../../utils/get-token.js";
import { validatePaginationParams } from "../../utils/validate-pagination-params.js";
import * as reviewService from "./review.service.js";

export const getReviews = async (req, res, next) => {
  try {
    const { page, limit, search, status } = req.query;
    const { validatedLimit, validatedOffset, validatedPage } = validatePaginationParams(limit, page);
    const validatedStatus = ["all", "approved", "pending"].includes(status) ? status : "all";
    const result = await reviewService.get_all(validatedLimit, validatedOffset, validatedPage, stringEscape(search || ""), validatedStatus);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const createPublicReview = async (req, res, next) => {
  try {
    const token = getToken(req);
    const result = await reviewService.create_by_type(req.body, "public", token.role);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateReview = async (req, res, next) => {
  try {
    const result = await reviewService.update(req.params.id, req.body);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const pinReview = async (req, res, next) => {
  try {
    const result = await reviewService.change_pinned_status(req.params.id, true);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const unpinnedReview = async (req, res, next) => {
  try {
    const result = await reviewService.change_pinned_status(req.params.id, false);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const approveReview = async (req, res, next) => {
  try {
    const result = await reviewService.approve(req.params.id);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const result = await reviewService.remove(req.params.id);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
