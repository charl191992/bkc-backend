import CustomError from "../../utils/custom-error.js";
import Enrollment from "./enrollment.schema.js";

export const createEnrollment = async (user_id, data) => {
  try {
    const proof = data.files.proof_of_payment[0];
    const proof_format =
      proof.originalname.split(".")[proof.originalname.split(".").length - 1];
    const proof_filename = `${crypto
      .randomUUID()
      .split("-")
      .join("")}.${proof_format}`;

    const report = data.files.report_card[0];
    const report_format =
      report.originalname.split(".")[report.originalname.split(".").length - 1];
    const report_filename = `${crypto
      .randomUUID()
      .split("-")
      .join("")}.${report_format}`;

    const enrollmentData = {
      student: user_id,
      education: {
        school: data.school,
        grade_level: data.grade_level,
      },
      mode: data.mode,
      purpose: data.purpose,
      report_card: `report-cards/${data.email}/${report_filename}`,
      subjects: data.subjects,
      days: data.days,
      hours_per_session: data.hours_per_session,
      proof_of_payment: `enrollments/${data.email}/${proof_filename}`,
    };

    const enrollment = await new Enrollment(enrollmentData).save();

    return { enrollment };
  } catch (error) {
    throw new CustomError(error.message, error.statusCode || 500);
  }
};
