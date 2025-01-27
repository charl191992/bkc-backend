import CustomError from "../../../utils/custom-error.js";
import AssessmentAnswer from "./assessment.answer.schema.js";

export const create_answer = async data => {
  try {
    const answer = await new AssessmentAnswer({
      answer: data.answer,
      assessment: data.assessment,
      assessment_section: data.assessment_section,
    }).save();

    if (!answer) throw new CustomError("Failed to create an answer.", 500);

    return {
      success: true,
      answer,
    };
  } catch (error) {
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

export const update_answer = async (id, data) => {
  try {
    const updates = { $set: { answer: data.answer } };
    const options = { new: true };

    const answer = await AssessmentAnswer.findByIdAndUpdate(
      id,
      updates,
      options
    )
      .select("answer assessment_section")
      .exec();

    if (!answer) throw new CustomError("Failed to update the answer", 500);

    return {
      success: true,
      answer,
    };
  } catch (error) {
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

export const delete_answer = async id => {
  try {
    const deleted = await AssessmentAnswer.deleteOne({ _id: id }).exec();

    if (deleted.deletedCount < 1)
      throw new CustomError("Failed to delete the answer", 500);

    return {
      success: true,
      answer: id,
    };
  } catch (error) {
    throw new CustomError(error.message, error.statusCode || 500);
  }
};
