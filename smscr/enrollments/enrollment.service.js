import setFullname from "../../utils/construct-fullname.js";
import CustomError from "../../utils/custom-error.js";
import { student } from "../../utils/roles.js";
import UserDetails from "../user_details/user-details.schema.js";
import User from "../users/user.schema.js";
import Enrollment from "./enrollment.schema.js";
import fs from "fs";

export const create_enrollment = async (data, files) => {
  let user_id = "",
    user_details_id = "",
    enrollment_id = "";

  try {
    const user = await new User({
      email: data.email,
      display_name: data.display_name,
      display_image: `uploads/enrollments/${files.display_image[0].filename}`,
      role: student,
      status: "enrolling",
    }).save();

    if (!user)
      throw new CustomError(
        "Failed to submit the enrollment form. Please try again.",
        400
      );

    user_id = user._id;

    const fullName = setFullname(
      data.firstname,
      data.lastname,
      data?.middlename || "",
      data?.extname || ""
    );

    const user_details = await new UserDetails({
      user: user._id,
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
    }).save();

    if (!user_details)
      throw new CustomError(
        "Failed to submit the enrollment form. Please try again.",
        400
      );

    user_details_id = user_details._id;

    const enrollment = await new Enrollment({
      fullname: fullName,
      studentDetails: user_details._id,
      studentAccount: user._id,
      education: {
        school: data.school,
        grade_level: data.grade_level,
      },
      mode: data.mode,
      purpose: data.purpose,
      subjects: JSON.parse(data.subjects),
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
    }).save();

    if (!enrollment)
      throw new CustomError(
        "Failed to submit the enrollment form. Please try again.",
        400
      );

    enrollment_id = enrollment._id;

    const userUpdate = await User.updateOne(
      { _id: user._id },
      {
        $set: {
          details: user_details._id,
          enrollment: enrollment._id,
        },
      }
    ).exec();

    if (userUpdate.modifiedCount < 1) {
      throw new CustomError(
        "Failed to submit the enrollment form. Please try again.",
        400
      );
    }
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

    if (user_id) await User.deleteOne({ _id: user_id }).exec();

    if (user_details_id)
      await UserDetails.deleteOne({ _id: user_details_id }).exec();

    if (enrollment_id)
      await Enrollment.deleteOne({ _id: enrollment_id }).exec();

    throw new CustomError(error.message, error.statusCode || 500);
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
        path: "studentDetails",
        populate: {
          path: "address.country",
          select: "-_id label",
        },
      })
      .populate({
        path: "studentAccount",
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
  try {
    const updates = { $set: { status } };
    const options = { new: true };
    const enrollment = await Enrollment.findByIdAndUpdate(
      id,
      updates,
      options
    ).exec();

    if (!enrollment)
      throw new CustomError(
        `Failed to ${
          status === "rejected" ? "reject" : "approve"
        } the enrollment`,
        500
      );

    return {
      success: true,
      status: enrollment.status,
    };
  } catch (error) {
    throw new CustomError(
      error.message ||
        `Failed to ${
          status === "rejected" ? "reject" : "approve"
        } the enrollment`,
      error.statusCode || 500
    );
  }
};
