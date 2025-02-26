import { body } from "express-validator";
import Enrollment from "../../../smscr/enrollments/enrollment.schema.js";
import Assessment from "../../../smscr/assessments/assessment.schema.js";
import isIdValid from "../../../utils/check-id.js";
import StudentAssessment from "../../../smscr/assessments/students/student-assessment.schema.js";

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
      if (enrollment.studentAssessments.length > 0) {
        throw new Error("Assessment already sent on this student");
      }

      req.enrollment = enrollment;

      if (enrollment.subjects.length !== req.body.assessments.length) {
        throw new Error(
          `The assessment you want sent does not match the subjects enrolled by the enrollee.`
        );
      }

      return true;
    }),
  body("assessments")
    .isArray()
    .withMessage("Invalid type of assessments ids")
    .custom(async (value, { req }) => {
      if (!req.enrollment) throw new Error("Enrollment validation failed");

      const enrollment = req.enrollment;
      const level = enrollment.education.grade_level;
      const subjects = enrollment.subjects.map(subject => subject.value);

      if (value.length < 1) throw new Error("Assessments is required");

      if (!value.every(id => isIdValid(id))) {
        throw new Error("Invalid assessment id detected");
      }

      const assessments = await Assessment.find({
        _id: { $in: value },
        status: "completed",
      }).exec();

      if (assessments.length !== value.length)
        throw new Error("Some assessments were not found or are not completed");

      for (const assessment of assessments) {
        if (
          !subjects.includes(`${assessment.subject}`) &&
          level !== assessment.level
        ) {
          throw Error(
            "Please send an assessment with the same grade level and subjects enrolled by the enrollee."
          );
        }
      }

      return true;
    }),
];

export default sendAssessmentRules;
