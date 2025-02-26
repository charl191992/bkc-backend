import CustomError from "../../../utils/custom-error.js";
import StudentAssessment from "./student-assessment.schema.js";
import Enrollment from "../../enrollments/enrollment.schema.js";
import { sendAssessmentEmail } from "../../email/email.service.js";
import jwtUtils from "../../../configs/token.js";
import Session from "../../sessions/session.schema.js";
import path from "path";

export const send_assessment = async data => {
  let sended = [];
  try {
    const { enrollment, assessments } = data;

    const access = jwtUtils.generate_assessment_access(enrollment);
    const session = await new Session({
      enrollment: enrollment,
      access: access.access,
      expiresIn: access.expiration,
      type: "assessment",
    }).save();

    if (!session) throw new CustomError("Failed to send the assessments.", 500);

    const sendAssessments = assessments.map(assessment => ({
      enrollment,
      assessment,
      answered: false,
      expiresIn: access.expiration,
    }));

    sended = await StudentAssessment.insertMany(sendAssessments);

    if (sended.length !== sendAssessments.length) {
      throw new CustomError("Failed to send the assessments.", 500);
    }

    let sendedIds = sended.map(e => e._id);

    const updatedEnrollment = await Enrollment.findOneAndUpdate(
      { _id: enrollment },
      { $set: { studentAssessments: sendedIds, status: "active assessment" } },
      { new: true }
    )
      .populate({
        path: "studentDetails",
        select: "name -_id",
      })
      .populate({
        path: "studentAccount",
        select: "email -_id",
      })
      .exec();

    if (!updatedEnrollment)
      throw new CustomError("Failed to send the assessments", 500);

    await sendAssessmentEmail(
      updatedEnrollment.studentAccount.email,
      "Bedrock Enrollment Assessment",
      path.resolve(
        global.rootDir,
        "smscr",
        "email",
        "templates",
        "send-assessment.html"
      ),
      {
        assessmentLink: `${process.env.APP_URL}/assessment/list?enrollee=${session._id}`,
        name: updatedEnrollment.studentDetails.name.fullname,
      }
    );

    const sendedAssessments = await StudentAssessment.find({
      _id: { $in: sended.map(e => e._id) },
    })
      .select("assessment answered expiresIn")
      .populate({
        path: "assessment",
        select: "title level subject country",
        populate: [
          {
            path: "subject",
            select: "-_id label",
          },
          {
            path: "level",
            select: "-_id label",
          },
          {
            path: "country",
            select: "-_id label",
          },
        ],
      })
      .exec();

    return {
      success: true,
      assessments: sendedAssessments,
    };
  } catch (error) {
    if (sended.length > 0) {
      const ids = sended.map(e => e._id);
      await StudentAssessment.deleteMany({ _id: { $in: ids } }).exec();
    }
    throw new CustomError(
      error.message || "Failed to send an assessment",
      error.statusCode || 500
    );
  }
};
