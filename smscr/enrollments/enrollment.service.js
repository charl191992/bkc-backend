import isIdValid from "../../utils/check-id.js";
import setFullname from "../../utils/construct-fullname.js";
import CustomError from "../../utils/custom-error.js";
import { student } from "../../utils/roles.js";
import User from "../users/user.schema.js";
import Enrollment from "./enrollment.schema.js";
import fs from "fs";
import * as SubjectService from "../subjects/subject.service.js";
import generatePassword from "../../helpers/password-generator.js";
import { sendEnrollmentApprovalEmail } from "../email/email.service.js";
import path from "path";
import mongoose from "mongoose";
import SubjectRequested from "../subjects/request/subject.request.schema.js";
import RequestedEducationLevel from "../education-levels/request/requested-education-level.schema.js";
import handleTime from "../../utils/handle-time.js";

export const create_enrollment = async (data, files) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const fullName = setFullname(data.firstname, data.lastname, data?.middlename || "", data?.extname || "");

    const user = await new User({
      email: data.email,
      role: student,
      status: "enrolling",
      details: {
        name: { firstname: data.firstname, lastname: data.lastname, fullname: fullName },
        gender: data.gender,
        birthdate: data.birthdate,
        contact: data.contact,
        nationality: data.nationality,
        address: data.address,
        country: data.country,
        guardian: { parent_name: data.parent_name, parent_contact: data.parent_contact, parent_email: data.parent_email },
        timezone: data.timezone,
      },
    }).save({ session });
    if (!user) throw new CustomError("Failed to submit the enrollment form. Please try again.", 400);

    const subjects = JSON.parse(data.subjects);
    let existing = [],
      requested = [];

    subjects.map(e => {
      if (isIdValid(e.value)) existing.push(e);
      if (!isIdValid(e.value)) requested.push(e);
    });

    if (requested.length > 0) {
      const newSubjects = await SubjectRequested.insertMany(
        requested.map(e => ({
          user: user._id,
          name: e.label,
        })),
        { session }
      );
      requested = [...newSubjects.map(e => ({ label: e.name, value: e._id }))];
    }

    const enrollmentData = {
      fullname: user.details.name.fullname,
      email: user.email,
      student: user._id,
      education: {
        school: data.school,
      },
      mode: data.mode,
      purpose: data.purpose,
      subjects: existing,
      requestedSubjects: requested,
      days: JSON.parse(data.days),
      time_start: handleTime(data.time_start, data.timezone),
      time_end: handleTime(data.time_end, data.timezone),
      report_card: {
        original_name: files.report_card[0].originalname,
        path: `uploads/enrollments/${files.report_card[0].filename}`,
      },
      proof_of_payment: {
        original_name: files.proof_of_payment[0].originalname,
        path: `uploads/enrollments/${files.proof_of_payment[0].filename}`,
      },
    };

    if (data.is_requested_grade_level === "true") {
      const requestedGradeLevel = await new RequestedEducationLevel({
        user: user._id,
        name: data.grade_level,
      }).save({ session });
      if (!requestedGradeLevel) {
        throw new CustomError("Failed to request the Grade/Education Level. Please try again.");
      }
      enrollmentData.education.requested_level = requestedGradeLevel._id;
    } else {
      enrollmentData.education.grade_level = data.grade_level;
    }

    const enrollment = await new Enrollment(enrollmentData).save({ session });
    if (!enrollment) throw new CustomError("Failed to submit the enrollment form. Please try again.", 400);

    const userUpdate = await User.updateOne({ _id: user._id }, { $set: { enrollment: enrollment._id } })
      .session(session)
      .exec();

    if (userUpdate.modifiedCount < 1) {
      throw new CustomError("Failed to submit the enrollment form. Please try again.", 400);
    }

    await session.commitTransaction();

    return {
      success: true,
      message: "Enrollment form successfully submitted. Please wait for an email for the next step. Thank you!.",
    };
  } catch (error) {
    if (files?.report_card) await fs.promises.unlink(files?.report_card[0].path);

    if (files?.proof_of_payment) await fs.promises.unlink(files?.proof_of_payment[0].path);

    await session.abortTransaction();
    throw new CustomError(error.message || "Failed to send enrollment form.", error.statusCode || 500);
  } finally {
    session.endSession();
  }
};

export const get_enrollments = async (limit, offset, page, search) => {
  try {
    const filter = {};
    if (search) filter.fullname = new RegExp(search, "i");

    const countPromise = Enrollment.countDocuments(filter);
    const enrollmentsPromise = Enrollment.find(filter)
      .populate({
        path: "education.grade_level",
        select: "-_id label",
      })
      .populate({
        path: "student",
        select: "-password",
      })
      .populate({
        path: "recommendation",
        populate: {
          path: "recommendedBy",
          select: "-_id details.name.fullname display_image email",
        },
      })
      .sort({
        createdAt: -1,
      })
      .skip(offset)
      .limit(limit)
      .lean()
      .exec();

    const [count, enrollments] = await Promise.all([countPromise, enrollmentsPromise]);

    const hasNextPage = count > offset + limit;
    const hasPrevPage = page > 1;
    const totalPages = Math.ceil(count / limit);

    return {
      success: true,
      enrollments,
      hasNextPage,
      hasPrevPage,
      totalPages,
    };
  } catch (error) {
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

export const get_enrollment_by_id = async id => {
  try {
    const enrollment = await Enrollment.findOne({ _id: id })
      .populate({
        path: "education.grade_level",
      })
      .populate({
        path: "student",
      })
      .exec();

    if (!enrollment) throw new CustomError("Enrollment not found", 400);
    return {
      success: true,
      enrollment,
    };
  } catch (error) {
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

export const change_enrollment_status = async (id, status) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const updates = { $set: { status } };
    const enrollment = await Enrollment.findByIdAndUpdate(id, updates).populate("student").session(session).exec();

    if (!enrollment) throw new CustomError(`Failed to ${status === "rejected" ? "reject" : "approve"} the enrollment`, 500);

    if (status === "approved") {
      const user = await User.findOne({
        email: enrollment.student?.email,
      })
        .session(session)
        .exec();
      if (!user) throw new CustomError("Student not found.", 404);

      const password = generatePassword();
      user.password = password;
      user.markModified("password");
      await user.savePassword(password);
      await user.save({ session });

      await sendEnrollmentApprovalEmail(user.email, "Bedrock Enrollment Approval", path.resolve(global.rootDir, "smscr", "email", "templates", "enrollment-approval.html"), {
        bedrockLink: `${process.env.APP_URL}/sign-in`,
        name: enrollment.student.details.name.fullname,
        username: user.email,
        password: password,
      });
    }

    await session.commitTransaction();

    return {
      success: true,
      status: status,
    };
  } catch (error) {
    await session.abortTransaction();
    throw new CustomError(error.message || `Failed to ${status === "rejected" ? "reject" : "approve"} the enrollment`, error.statusCode || 500);
  } finally {
    session.endSession();
  }
};

export const enrollment_subject_approval = async (enrollment_id, subject_id, status) => {
  try {
    const updatedSubject = await SubjectService.change_subject_status(subject_id, status === "approve" ? "approved" : "rejected");
    const { subject, success } = updatedSubject;

    if (!success) throw new CustomError(`Failed to ${status} the subject`);

    const updates = {
      $pull: { requestedSubjects: { value: updatedSubject.subject._id } },
    };

    if (status === "approve") {
      updates.$push = {
        subjects: { label: subject.label, value: subject._id },
      };
    }

    const options = { new: true };

    const updatedEnrollment = await Enrollment.findByIdAndUpdate(enrollment_id, updates, options).exec();
    if (!updatedEnrollment) throw new CustomError(`Failed to ${status} the subject`);

    return {
      success: true,
      requested: updatedEnrollment.requestedSubjects,
      existing: updatedEnrollment.subjects,
    };
  } catch (error) {
    throw new CustomError(error.message || "Failed to change the status of the subject", error.statusCode || 500);
  }
};
