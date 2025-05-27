import CustomError from "../../../utils/custom-error.js";
import StudentAssessment from "./student-assessment.schema.js";
import Enrollment from "../../enrollments/enrollment.schema.js";
import { sendAssessmentEmail } from "../../email/email.service.js";
import path from "path";
import mongoose from "mongoose";
import Assessment from "../assessment.schema.js";
import generatePin from "../../../utils/generate-pin.js";

export const get_assessments_by_enrollment = async enrollment => {
  try {
    const student = await Enrollment.findOne({ _id: enrollment })
      .select("-createdAt -assessments -updatedAt -__v")
      .populate({ path: "education.grade_level" })
      .populate({ path: "student" })
      .lean()
      .exec();

    const assessments = await StudentAssessment.find({ enrollment })
      .populate("sections.questions.studentAnswer")
      .select("-__v -updatedAt -taken -code -assessment -createdAt -enrollment -_id -level")
      .lean()
      .sort({ createdAt: -1 })
      .exec();

    return {
      success: true,
      assessments,
      enrollment: student,
    };
  } catch (error) {
    throw new CustomError(error.message || "Failed to get the assessments", error.statusCode || 500);
  }
};

export const send_assessment = async data => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const assessmentPromise = Assessment.findOne({ _id: data.assessment, status: "completed" })
      .select("-createdAt -updatedAt -__v -country")
      .populate({
        path: "level",
        select: "label _id",
      })
      .populate({
        path: "subject",
        select: "label _id",
      })
      .populate({
        path: "sections",
        select: "-createdAt -updatedAt -__v -assessment",
        populate: {
          path: "questions",
          select: "-createdAt -updatedAt -__v -assessment -section",
        },
      })
      .exec();
    const enrollmentPromise = Enrollment.findById(data.enrollment)
      .populate({
        path: "student",
      })
      .exec();
    const [assessment, enrollment] = await Promise.all([assessmentPromise, enrollmentPromise]);

    const code = generatePin();

    const saData = {
      enrollment: data.enrollment,
      assessment: assessment._id,
      title: assessment.title,
      type: assessment.type,
      level: {
        id: assessment.level._id,
        name: assessment.level.label,
      },
      subject: {
        id: assessment.subject._id,
        name: assessment.subject.label,
      },
      sections: assessment.sections,
      code: code,
    };

    const studentAssessment = await new StudentAssessment(saData).save({ session });
    if (!studentAssessment) {
      throw new CustomError("Failed to send an assessment", 400);
    }

    const assessmentData = { studentAssessment: studentAssessment._id, assessment: assessment._id };
    const updated = await Enrollment.updateOne({ _id: studentAssessment.enrollment }, { $push: { assessments: assessmentData } }, { session }).exec();

    if (updated.modifiedCount < 1 || updated.matchedCount < 1) {
      throw new CustomError("Failed to send an assessment", 400);
    }

    await sendAssessmentEmail(enrollment.email, "Bedrock Student Assessment", path.resolve(global.rootDir, "smscr", "email", "templates", "send-assessment.html"), {
      assessmentLink: `${process.env.APP_URL}/assessment/${studentAssessment._id}`,
      name: enrollment.fullname,
      parent_name: enrollment.student.details.guardian.parent_name,
      code: studentAssessment.code,
    });

    await session.commitTransaction();

    return {
      success: true,
      assessment: assessmentData,
    };
  } catch (error) {
    await session.abortTransaction();
    throw new CustomError(error.message || "Failed to send an assessment", error.statusCode || 500);
  } finally {
    session.endSession();
  }
};

export const take_assessment = async data => {
  try {
    const { code, id } = data;

    const assessment = await StudentAssessment.findOne({ _id: id, taken: false }).select("-sections.questions.answer -__v -updatedAt -taken").exec();
    if (!assessment) {
      throw new CustomError("Assessment not found", 400);
    }

    if (`${assessment.code}` !== code) {
      throw new CustomError("Invalid assessment code", 400);
    }

    assessment.duration.start = new Date().toISOString();
    await assessment.save();

    const studentAssessment = assessment.toObject();
    delete studentAssessment.code;

    return {
      success: true,
      assessment: studentAssessment,
    };
  } catch (error) {
    throw new CustomError(error.message || "Failed to agree on agreement", error.statusCode || 500);
  }
};

export const add_answer = async data => {
  try {
    const { assessment, section, question, answer } = data;

    const filters = { _id: assessment, "sections._id": section, "sections.questions._id": question };
    const updates = { $set: { "sections.$[section].questions.$[question].studentAnswer": answer } };
    const arrayFilters = { arrayFilters: [{ "section._id": section }, { "question._id": question }] };

    const updated = await StudentAssessment.updateOne(filters, updates, arrayFilters).exec();
    if (updated.matchedCount < 1 || updated.modifiedCount < 1) {
      throw new CustomError("Failed to set an answer.Please try again.", 500);
    }

    return {
      success: true,
      answer: { assessment, section, question, answer },
    };
  } catch (error) {
    throw new CustomError(error.message || "Failed to set an answer. Please try again.", error.statusCode || 500);
  }
};

export const submit_assessment = async data => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const filter = { _id: data.id, "sections.questions.studentAnswer": null };
    const exists = await StudentAssessment.exists(filter);
    if (exists) {
      throw new CustomError("All questions are not yet answered", 400);
    }

    const updated = await StudentAssessment.findOneAndUpdate({ _id: data.id, taken: false }, { $set: { taken: true } }, { new: true, session }).lean();

    if (!updated) {
      throw new CustomError("Assessment not found or already completed");
    }

    const updatedEnrollment = await Enrollment.findOneAndUpdate(
      { _id: updated.enrollment, "assessments.studentAssessment": data.id },
      { $set: { "assessments.$.taken": true } },
      { new: true, session }
    ).exec();

    if (updatedEnrollment.assessments.every(assessment => assessment.taken)) {
      updatedEnrollment.status = "for recommendation";
      updatedEnrollment.markModified("status");
      await updatedEnrollment.save(session);
    }

    await session.commitTransaction();
    return { success: true };
  } catch (error) {
    await session.abortTransaction();
    throw new CustomError(error.message || "Failed to submit the assessment", error.statusCode || 500);
  } finally {
    session.endSession();
  }
};
