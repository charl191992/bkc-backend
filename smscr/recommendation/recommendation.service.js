import mongoose from "mongoose";
import path from "path";
import Recommendation from "./recommendation.schema.js";
import CustomError from "../../utils/custom-error.js";
import { sendRecommendation } from "../email/email.service.js";
import Enrollment from "../enrollments/enrollment.schema.js";

export const create_recommendation = async (data, token) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const enrollment = await Enrollment.findById(data.enrollment).lean().exec();
    const recommendation = await new Recommendation({
      enrollment: data.enrollment,
      recommendation: data.recommendation,
      schedule: {
        days: data.days,
        time_start: enrollment.time_start,
        time_end: enrollment.time_end,
      },
      recommendedBy: token._id,
    }).save({ session });

    if (!recommendation) {
      throw new CustomError("Failed to send the recommendation ", 500);
    }

    await Enrollment.updateOne({ _id: recommendation.enrollment }, { $set: { recommendation: recommendation._id, status: "for scheduling" } })
      .session(session)
      .exec();

    await sendRecommendation(enrollment.email, "Bedrock Enrollment Recommendation", path.resolve(global.rootDir, "smscr", "email", "templates", "recommendation.html"), {
      bedrockLink: `${process.env.APP_URL}`,
      content: recommendation.recommendation,
      name: enrollment.fullname,
    });

    await session.commitTransaction();

    return {
      success: true,
      recommendation,
    };
  } catch (error) {
    await session.abortTransaction();
    throw new CustomError(error.message || "Failed to send the recommendation", error.statusCode || 500);
  } finally {
    session.endSession();
  }
};
