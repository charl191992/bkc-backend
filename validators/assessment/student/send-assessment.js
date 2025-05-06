import { body } from "express-validator";
import Enrollment from "../../../smscr/enrollments/enrollment.schema.js";
import Assessment from "../../../smscr/assessments/assessment.schema.js";

const sendAssessmentRules = [
  body("enrollment")
    .trim()
    .notEmpty()
    .withMessage("Enrollment id is required")
    .isMongoId()
    .withMessage("Invalid enrollment id")
    .custom(async (value, { req }) => {
      const enrollment = await Enrollment.findOne({ _id: value }).exec();
      if (!enrollment) throw new Error("Enrollment not found");

      if (
        enrollment.assessments.length ===
        enrollment.requestedSubjects.length + enrollment.subjects.length
      ) {
        throw new Error("Assessments already sent to this enrollee");
      }

      req.enrollment = enrollment;

      return true;
    }),
  body("assessment")
    .trim()
    .notEmpty()
    .withMessage("Assessment id is required")
    .isMongoId()
    .withMessage("Invalid assessment id")
    .custom(async (value, { req }) => {
      if (!req.enrollment) throw new Error("Enrollment validation failed");
      const enrollment = req.enrollment;

      if (enrollment.assessments.includes(value)) {
        throw new Error("Assessment already sent to this enrollee.");
      }

      const level = enrollment.education.grade_level;
      const subjects = enrollment.subjects.map(subject => subject.value);

      const assessment = await Assessment.findOne({
        _id: value,
        status: "completed",
      }).exec();
      if (!assessment) throw new Error("Assessment not found");

      if (
        !subjects.includes(`${assessment.subject}`) &&
        level !== assessment.level
      ) {
        throw Error(
          "Please send an assessment with the same grade level and subject enrolled by the enrollee."
        );
      }

      return true;
    }),
];

export default sendAssessmentRules;
