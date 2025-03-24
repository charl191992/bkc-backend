import isIdValid from "../../../utils/check-id.js";
import CustomError from "../../../utils/custom-error.js";
import getToken from "../../../utils/get-token.js";
import { validatePaginationParams } from "../../../utils/validate-pagination-params.js";
import * as notificationService from "./notification-recipient.service.js";

export const getNotifications = async (req, res, next) => {
  try {
    const token = getToken(req);
    const page = req.query.page;
    const limit = req.query.limit;
    const { validatedLimit, validatedOffset, validatedPage } =
      validatePaginationParams(limit, page);
    const result = await notificationService.get_notifications(
      token,
      validatedLimit,
      validatedOffset,
      validatedPage
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const token = getToken(req);
    const id = req.params.id;
    if (!isIdValid(id)) throw new CustomError("Invalid notification id", 400);
    const result = await notificationService.mark_as_read(id, token);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    const token = getToken(req);
    const result = await notificationService.mark_all_as_read(token);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
