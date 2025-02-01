import CustomError from "../../utils/custom-error.js";
import Enrollment from "./enrollment.schema.js";

export const create_enrollment = async (data, files) => {
  try {
    console.log("DATA: ", data);
    console.log("FILES: ", files);

    return {
      data,
      files,
    };
  } catch (error) {
    throw new CustomError(error.message, error.statusCode || 500);
  }
};
