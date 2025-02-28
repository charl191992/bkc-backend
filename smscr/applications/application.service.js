import { countries } from "../../constants/countries.js";
import setFullname from "../../utils/construct-fullname.js";
import CustomError from "../../utils/custom-error.js";
import Application from "./application.schema.js";
import User from "../users/user.schema.js";
import UserDetails from "../user_details/user-details.schema.js";
import generatePassword from "../../helpers/password-generator.js";
import { teacher } from "../../utils/roles.js";
import { sendApplicationApprovalEmail } from "../email/email.service.js";
import path from "path";

export const createApplication = async data => {
  try {
    const fullname = setFullname(
      data.firstname,
      data.lastname,
      data.middlename || "",
      data.extname || ""
    );

    const country = countries.find(item => item.value === data.country);

    const applicationData = {
      email: data.email,
      name: {
        firstname: data.firstname,
        middlename: data.middlename || "",
        lastname: data.lastname,
        extname: data.extname || "",
        fullname: fullname,
        status: "for-review",
      },
      country: country,
      subjects: data.subjects,
      days: data.days,
      session_per_day: data.session_per_day,
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
    if (!application)
      throw new CustomError("Failed to send an application", 500);

    return { success: true };
  } catch (error) {
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

export const get_applications = async (limit, offset, page, search) => {
  try {
    const filter = {};
    if (search) {
      filter.$or = [
        { email: new RegExp(search, "i") },
        { "name.fullname": new RegExp(search, "i") },
      ];
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

    const [count, applications] = await Promise.all([
      countPromise,
      applicationsPromise,
    ]);

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
  let old_status, user_id, user_details_id;
  try {
    const updatedApplication = await Application.findByIdAndUpdate(id, {
      $set: { status },
    });

    if (!updatedApplication)
      throw new CustomError("Failed to change the application status.", 400);

    old_status = updatedApplication.status;

    if (status === "approved") {
      const doesExist = await User.exists({
        email: updatedApplication.email,
      }).exec();
      if (doesExist) throw new CustomError("Email already exists.", 400);

      const password = generatePassword();
      const userData = new User({
        email: updatedApplication.email,
        password: password,
        role: teacher,
        status: "active",
        application: updatedApplication._id,
      });
      await userData.savePassword(password);
      const user = await userData.save();

      if (!user)
        throw new CustomError(
          `Failed to approve this application. Please try again`,
          500
        );

      user_id = user._id;

      const user_details = await new UserDetails({
        user: user._id,
        name: updatedApplication.name,
        address: {
          address_one: "",
          address_two: "",
          city: "",
          province: "",
          country: updatedApplication.country.value,
          zip: "",
        },
        timezone: updatedApplication.timezone,
      }).save();

      if (!user_details)
        throw new CustomError(
          `Failed to approve this application. Please try again`,
          500
        );

      user_details_id = user_details._id;

      const updated = await User.updateOne(
        { _id: user._id },
        { $set: { details: user_details._id } }
      ).exec();

      if (!updated.acknowledged)
        throw new CustomError(
          `Failed to approve this application. Please try again`,
          500
        );

      await sendApplicationApprovalEmail(
        user.email,
        "Bedrock Enrollment Application",
        path.resolve(
          global.rootDir,
          "smscr",
          "email",
          "templates",
          "application-approval.html"
        ),
        {
          bedrockLink: `${process.env.APP_URL}/sign-in`,
          name: updatedApplication.name.fullname,
          username: user.email,
          password: password,
        }
      );
    }

    return {
      success: true,
      status: updatedApplication.status,
    };
  } catch (error) {
    if (old_status) {
      await Application.updateOne(
        { _id: id },
        { $set: { status: old_status } }
      ).exec();
    }
    if (user_id) {
      await User.deleteOne({ _id: user_id }).exec();
    }
    if (user_details_id) {
      await UserDetails.deleteOne({ _id: user_details_id }).exec();
    }
    throw new CustomError(error.message, error.statusCode || 500);
  }
};
