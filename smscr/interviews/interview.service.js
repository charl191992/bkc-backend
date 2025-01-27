import isIdValid from "../../utils/check-id.js";
import CustomError from "../../utils/custom-error.js";
import Application from "../applications/application.schema.js";
import Interview from "./interview.schema.js";

export const get_incoming_interviews = async (limit, offset, page) => {
  try {
    const start = new Date();
    const end = new Date();

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const filter = {
      date: {
        $gte: start,
        $lte: end,
      },
    };

    const countPromise = Interview.countDocuments(filter);
    const interviewsPromise = Interview.find(filter)
      .populate({
        path: "application",
        select: "name",
      })
      .sort({
        date: -1,
      })
      .skip(offset)
      .limit(limit)
      .exec();

    const [count, interviews] = await Promise.all([
      countPromise,
      interviewsPromise,
    ]);

    const hasNextPage = count > offset + limit;
    const hasPrevPage = page > 1;
    const totalPages = Math.ceil(count / limit);

    return {
      success: true,
      interviews,
      hasNextPage,
      hasPrevPage,
      totalPages,
    };
  } catch (error) {
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

export const schedule_meeting = async (data, interviewer) => {
  try {
    const interview = await new Interview({
      application: data.application,
      interviewer: interviewer,
      date: data.date,
      start: data.start_time,
      end: data.end_time,
      members: [],
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

export const update_schedule = async (id, data) => {
  try {
    const updatedInterview = await Interview.findOneAndUpdate(
      { _id: id, application: data.application },
      {
        $set: {
          date: data.date,
          start: data.start_time,
          end: data.end_time,
        },
      },
      { new: true }
    );

    if (!updatedInterview)
      throw new CustomError("Failed to reschedule an interview.", 500);

    return {
      success: true,
      interview: updatedInterview,
    };
  } catch (error) {
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

export const get_interview_by_id = async id => {
  try {
    const interview = await Interview.findById(id)
      .populate({
        path: "application",
      })
      .exec();

    if (!interview) throw new CustomError("Interview not found", 400);
    // Must check if interview already cancelled

    return {
      success: true,
      interview,
    };
  } catch (error) {
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

export const add_interview_members = async (interviewId, memberId) => {
  try {
    if (!isIdValid(interviewId))
      throw new CustomError("Invalid Interview ID", 400);

    if (!memberId) throw new CustomError("Invalid Member ID", 400);

    const interview = await Interview.findByIdAndUpdate(
      interviewId,
      { $addToSet: { members: memberId } },
      { new: true }
    );

    if (!interview) throw new CustomError("Invalid Interview", 400);

    return {
      success: true,
      members: interview.members,
    };
  } catch (error) {
    throw new CustomError(error.message, error.statusCode || 500);
  }
};
