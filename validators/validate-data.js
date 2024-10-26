import { validationResult } from "express-validator";
import CustomError from "../utils/custom-error.js";
import fs from "fs";

const validateData = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    if (req.file) await fs.promises.unlink(req.file.path);

    const groupedErrors = errors.array().reduce((acc, error) => {
      if (!acc[error.path]) {
        acc[error.path] = [];
      }
      acc[error.path].push(error.msg);
      return acc;
    }, {});

    const formattedErrors = Object.keys(groupedErrors).map(path => ({
      path,
      msgs: groupedErrors[path],
    }));

    next(new CustomError("Invalid data", 400, formattedErrors));
  } else {
    next();
  }
};

export default validateData;
