import isIdValid from "../../utils/check-id.js";
import setFullname from "../../utils/construct-fullname.js";
import CustomError from "../../utils/custom-error.js";
import { student } from "../../utils/roles.js";
import Subject from "../subjects/subject.schema.js";
import User from "../users/user.schema.js";
import Enrollment from "./enrollment.schema.js";
import fs from "fs";
import * as SubjectService from "../subjects/subject.service.js";
import generatePassword from "../../helpers/password-generator.js";
import { sendEnrollmentApprovalEmail } from "../email/email.service.js";
import path from "path";
import mongoose from "mongoose";

export const create_enrollment = async (data, files) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const fullName = setFullname(
      data.firstname,
      data.lastname,
      data?.middlename || "",
      data?.extname || ""
    );

    const user = await new User({
      email: data.email,
      display_name: data.display_name,
      display_image: `uploads/enrollments/${files.display_image[0].filename}`,
      role: student,
      status: "enrolling",
      details: {
        name: {
          firstname: data.firstname,
          middlename: data?.middlename || "",
          lastname: data.lastname,
          extname: data?.extname || "",
          fullname: fullName,
        },
        gender: data.gender,
        birthdate: data.birthdate,
        contact: data.contact,
        nationality: data.nationality,
        address: {
          address_one: data.address_one,
          address_two: data.address_two || "",
          city: data.city,
          province: data.province,
          country: data.country,
          zip: data.zip,
        },
        relatives: {
          father_name: data.father_name || "",
          father_contact: data.father_contact || "",
          mother_name: data.mother_name || "",
          mother_contact: data.mother_contact || "",
          guardian_name: data.guardian_name || "",
          guardian_contact: data.guardian_contact || "",
        },
        timezone: data.timezone,
      },
    }).save({ session });
    if (!user)
      throw new CustomError(
        "Failed to submit the enrollment form. Please try again.",
        400
      );

    const subjects = JSON.parse(data.subjects);
    let existing = [],
      requested = [];

    subjects.map(e => {
      if (isIdValid(e.value)) existing.push(e);
      if (!isIdValid(e.value)) requested.push(e);
    });

    if (requested.length > 0) {
      const newSubjects = await Subject.insertMany(
        requested.map(e => ({
          label: e.label,
          status: "pending",
        })),
        { session }
      );
      requested = [...newSubjects.map(e => ({ label: e.label, value: e._id }))];
    }

    const enrollment = await new Enrollment({
      fullname: fullName,
      student: user._id,
      education: {
        school: data.school,
        grade_level: data.grade_level,
      },
      mode: data.mode,
      purpose: data.purpose,
      subjects: existing,
      requestedSubjects: requested,
      days: JSON.parse(data.days),
      hours_per_session: data.hours_per_session,
      report_card: {
        original_name: files.report_card[0].originalname,
        path: `uploads/enrollments/${files.report_card[0].filename}`,
      },
      proof_of_payment: {
        original_name: files.proof_of_payment[0].originalname,
        path: `uploads/enrollments/${files.proof_of_payment[0].filename}`,
      },
    }).save({ session });
    if (!enrollment)
      throw new CustomError(
        "Failed to submit the enrollment form. Please try again.",
        400
      );

    const userUpdate = await User.updateOne(
      { _id: user._id },
      { $set: { enrollment: enrollment._id } }
    )
      .session(session)
      .exec();

    if (userUpdate.modifiedCount < 1) {
      throw new CustomError(
        "Failed to submit the enrollment form. Please try again.",
        400
      );
    }

    await session.commitTransaction();

    return {
      success: true,
      message:
        "Enrollment form successfully submitted. Please wait for an email for the next step. Thank you!.",
    };
  } catch (error) {
    if (files?.display_image)
      await fs.promises.unlink(files?.display_image[0].path);

    if (files?.report_card)
      await fs.promises.unlink(files?.report_card[0].path);

    if (files?.proof_of_payment)
      await fs.promises.unlink(files?.proof_of_payment[0].path);

    await session.abortTransaction();
    throw new CustomError(error.message, error.statusCode || 500);
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
        path: "studentAssessments",
        select: "assessment answered expiresIn",
        populate: {
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
        },
      })
      .sort({
        createdAt: -1,
      })
      .skip(offset)
      .limit(limit)
      .exec();

    const [count, enrollments] = await Promise.all([
      countPromise,
      enrollmentsPromise,
    ]);

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
    throw CustomError(error.message, error.statusCode || 500);
  }
};

export const get_enrollment_by_id = async id => {
  try {
    const enrollment = await Enrollment.findOne({ _id: id })
      .populate({
        path: "education.grade_level",
      })
      .populate({
        path: "studentDetails",
        populate: {
          path: "address.country",
        },
      })
      .populate({
        path: "studentAccount",
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
    const enrollment = await Enrollment.findByIdAndUpdate(id, updates)
      .populate("student")
      .session(session)
      .exec();

    if (!enrollment)
      throw new CustomError(
        `Failed to ${
          status === "rejected" ? "reject" : "approve"
        } the enrollment`,
        500
      );

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

      await sendEnrollmentApprovalEmail(
        user.email,
        "Bedrock Enrollment Approval",
        path.resolve(
          global.rootDir,
          "smscr",
          "email",
          "templates",
          "enrollment-approval.html"
        ),
        {
          bedrockLink: `${process.env.APP_URL}/sign-in`,
          name: enrollment.student.details.name.fullname,
          username: user.email,
          password: password,
        }
      );
    }

    await session.commitTransaction();

    return {
      success: true,
      status: status,
    };
  } catch (error) {
    await session.abortTransaction();
    throw new CustomError(
      error.message ||
        `Failed to ${
          status === "rejected" ? "reject" : "approve"
        } the enrollment`,
      error.statusCode || 500
    );
  } finally {
    session.endSession();
  }
};

export const enrollment_subject_approval = async (
  enrollment_id,
  subject_id,
  status
) => {
  try {
    const updatedSubject = await SubjectService.change_subject_status(
      subject_id,
      status === "approve" ? "approved" : "rejected"
    );
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

    const updatedEnrollment = await Enrollment.findByIdAndUpdate(
      enrollment_id,
      updates,
      options
    ).exec();
    if (!updatedEnrollment)
      throw new CustomError(`Failed to ${status} the subject`);

    return {
      success: true,
      requested: updatedEnrollment.requestedSubjects,
      existing: updatedEnrollment.subjects,
    };
  } catch (error) {
    throw new CustomError(
      error.message || "Failed to change the status of the subject",
      error.statusCode || 500
    );
  }
};
