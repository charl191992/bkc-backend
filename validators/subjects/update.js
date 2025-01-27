import { body, param } from "express-validator";
import Subject from "../../smscr/subjects/subject.schema.js";
import { stringEscape } from "../../utils/escape-string.js";

const updateSubjectRules = [
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
  body("subject")
    .trim()
    .notEmpty()
    .withMessage("Subject is required")
    .custom(async value => {
      const subject = stringEscape(value);
      const regex = new RegExp(`^${subject}$`, "i");
      const exists = await Subject.exists({
        label: { $regex: regex },
      });
      if (exists) {
        throw new Error("Subject already exists");
      }
      return true;
    }),
];

export default updateSubjectRules;
