import { body } from "express-validator";
import { stringEscape } from "../../utils/escape-string.js";
import Subject from "../../smscr/subjects/subject.schema.js";

const createSubjectRules = [
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

export default createSubjectRules;
