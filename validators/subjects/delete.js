import { param } from "express-validator";
import Subject from "../../smscr/subjects/subject.schema.js";

const checkSubjectIdRules = [
  param("id")
    .trim()
    .notEmpty()
    .withMessage("Subject ID is required")
    .isMongoId()
    .withMessage("Invalid subject id.")
    .custom(async value => {
      const subject = await Subject.exists({ _id: value });
      if (!subject) throw new Error("Subject not found");
      return true;
    }),
];

export default checkSubjectIdRules;
