import User from "./user.schema.js";
import crypto from "crypto";
import { createUserDetails } from "../user_details/user-details.service.js";
import { createApplication } from "../applications/application.service.js";
import { createEnrollment } from "../enrollments/enrollment.service.js";
import CustomError from "../../utils/custom-error.js";

export const register = async data => {
  try {
    const file = data.files.display_image[0];
    const format =
      file.originalname.split(".")[file.originalname.split(".").length - 1];
    const filename = `${crypto.randomUUID().split("-").join("")}.${format}`;

    const userData = {
      email: data.email,
      role: data.role,
      display_image: `profiles/${data.email}/${filename}`,
    };

    if (type !== "student") {
      userData.password = data.password;
    }

    const user = new User(userData);
    if (type !== "student") await user.savePassword(data.password);
    const newUser = await user.save();

    const details = await createUserDetails(newUser._id, data);

    let updates = { details: details._id };

    if (type === "student") {
      const enrollment = await createEnrollment(newUser._id, data);
      updates.enrollment = enrollment._id;
    }

    if (type === "teacher") {
      const application = await createApplication(newUser._id, data);
      updates.application = application._id;
    }

    await User.findByIdAndUpdate(newUser._id, {
      $set: updates,
    }).exec();

    let message =
      type === "student"
        ? "Enrollment successfully sent."
        : type === "teacher"
        ? "Application successfully sent."
        : "Successfully created.";

    return {
      success: true,
      message,
    };
  } catch (error) {
    throw new CustomError(error.message, error.statusCode || 500);
  }
};
