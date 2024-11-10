import CustomError from "../../utils/custom-error";
import Application from "../applications/application.schema.js";
import Interview from "./interview.schema.js";

export const schedule_meeting = async (data, interviewer) => {
  try {
    const interview = await new Interview({
      application: data.application,
      interviewer: interviewer,
      start: data.start,
      end: data.end,
    }).save();

    if (!interview)
      throw new CustomError("Failed to set a schedule for an interview.", 500);

    await Application.findByIdAndUpdate(interview.application, {
      $set: { interview: interview._id, status: "for-interview" },
    }).exec();

    return {
      success: true,
      interview,
    };
  } catch (error) {
    throw new CustomError(error.message, error.statusCode || 500);
  }
};
