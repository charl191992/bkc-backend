import CustomError from "../../../utils/custom-error.js";
import AssessmentSection from "./assessment.section.schema.js";
import AssessmentAnswer from "../answers/assessment.answer.schema.js";

export const create_assessment_section = async data => {
  try {
    const { assessment_id, instruction } = data;

    const assessment_section = await new AssessmentSection({
      assessment: assessment_id,
      instruction,
    }).save();

    if (!assessment_section)
      throw new CustomError("Failed to create a new section.", 500);

    return {
      success: true,
      section: { ...assessment_section._doc, answers: [] },
    };
  } catch (error) {
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

export const update_assessment_section = async (id, data) => {
  try {
    const { instruction } = data;

    const updated = await AssessmentSection.findByIdAndUpdate(
      id,
      { $set: { instruction } },
      { new: true }
    ).exec();

    if (!updated) throw new CustomError("Failed to update the section.", 500);

    return {
      success: true,
      section: updated,
    };
  } catch (error) {
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

export const delete_assessment_section = async id => {
  try {
    const deleted = await AssessmentSection.deleteOne({ _id: id }).exec();

    if (deleted.deletedCount < 1)
      throw new CustomError("Failed to delete the section.", 500);

    const answers = await AssessmentAnswer.find({
      assessment_section: id,
    }).exec();

    if (answers.length > 0) {
      const ids = answers.map(answer => answer._id);
      await AssessmentAnswer.deleteMany(ids).exec();
    }

    return {
      success: true,
      section: id,
    };
  } catch (error) {
    throw new CustomError(error.message, error.statusCode || 500);
  }
};
