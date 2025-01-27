import CustomError from "../../utils/custom-error.js";
import * as OptionService from "./options.service.js";

export const getOptions = async (req, res, next) => {
  try {
    const result = await OptionService.get_options();
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
