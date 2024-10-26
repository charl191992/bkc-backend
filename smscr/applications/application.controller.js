import * as ApplicationService from "./application.service.js";

export const sendApplication = async (req, res, next) => {
  try {
    const result = await ApplicationService.createApplication(req.body);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
