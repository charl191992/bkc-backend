import * as EnrollmentService from "./enrollment.service.js";

export const studentEnroll = async (req, res, next) => {
  try {
    const result = await EnrollmentService.create_enrollment(
      req.body,
      req.files
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
