import setFullname from "../../utils/construct-fullname.js";
import CustomError from "../../utils/custom-error.js";
import Application from "./application.schema.js";
import User from "../users/user.schema.js";
import generatePassword from "../../helpers/password-generator.js";
import { teacher } from "../../utils/roles.js";
import { sendApplicationApprovalEmail } from "../email/email.service.js";
import path from "path";
import mongoose from "mongoose";

export const createApplication = async data => {
  try {
    const fullname = setFullname(data.firstname, data.lastname, data.middlename || "", data.extname || "");

    const applicationData = {
      email: data.email,
      name: {
        firstname: data.firstname,
        lastname: data.lastname,
        fullname: fullname,
      },
      status: "for-review",
      country: data.country,
      subjects: data.subjects,
      days: data.days,
      hours_per_session: data.hours_per_session,
      equipment: {
        stable_internet: data.stable_internet,
        noise_cancelling_headphones: data.noise_cancelling_headphones,
        microphone: data.has_microphone,
      },
      cv_link: data.cv_link,
      introduction_link: data.introduction_link,
      timezone: data.timezone,
    };

    const application = await new Application(applicationData).save();
    if (!application) throw new CustomError("Failed to send an application", 500);

    return { success: true };
  } catch (error) {
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

export const get_applications = async (limit, offset, page, search) => {
  try {
    const filter = {};
    if (search) {
      filter.$or = [{ email: new RegExp(search, "i") }, { "name.fullname": new RegExp(search, "i") }];
    }

    const countPromise = Application.countDocuments(filter);
    const applicationsPromise = Application.find(filter)
      .populate({
        path: "interview",
      })
      .sort({
        createdAt: -1,
      })
      .skip(offset)
      .limit(limit)
      .exec();

    const [count, applications] = await Promise.all([countPromise, applicationsPromise]);

    const hasNextPage = count > offset + limit;
    const hasPrevPage = page > 1;
    const totalPages = Math.ceil(count / limit);

    return {
      success: true,
      applications,
      hasNextPage,
      hasPrevPage,
      totalPages,
    };
  } catch (error) {
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

export const change_status = async (id, status) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const updatedApplication = await Application.findByIdAndUpdate(id, {
      $set: { status },
    }).session(session);
    if (!updatedApplication) throw new CustomError("Failed to change the application status.", 400);

    if (status === "approved") {
      const password = generatePassword();
      const userData = new User({
        email: updatedApplication.email,
        password: password,
        role: teacher,
        status: "active",
        details: {
          name: updatedApplication.name,
          country: updatedApplication.country,
          address: "",
          timezone: updatedApplication.timezone,
        },
        application: updatedApplication._id,
      });
      await userData.savePassword(password);
      const user = await userData.save({ session });

      if (!user) throw new CustomError(`Failed to approve this application. Please try again`, 500);

      await Application.updateOne({ _id: updatedApplication._id }, { $set: { teacher: user._id } }, { session });

      await sendApplicationApprovalEmail(user.email, "Bedrock Application Approval", path.resolve(global.rootDir, "smscr", "email", "templates", "application-approval.html"), {
        bedrockLink: `${process.env.APP_URL}/sign-in`,
        name: updatedApplication.name.fullname,
        username: user.email,
        password: password,
      });
    }

    await session.commitTransaction();

    return {
      success: true,
      status: updatedApplication.status,
    };
  } catch (error) {
    await session.abortTransaction();
    throw new CustomError(error.message, error.statusCode || 500);
  } finally {
    session.endSession();
  }
};
