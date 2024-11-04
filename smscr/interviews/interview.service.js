import CustomError from "../../utils/custom-error";
import Interview from "./interview.schema.js";

export const schedule_meeting = async (data, interviewer) => {
  try {
    const interview = await new Interview({
      application: data.application,
      interviewer: interviewer,
      dateAndTime: data.dateAndTime,
    }).save();

    if (!interview)
      throw new CustomError("Failed to set a schedule for an interview.", 500);

    return {
      success: true,
      interview,
    };
  } catch (error) {
    throw new CustomError(error.message, error.statusCode || 500);
  }
};
