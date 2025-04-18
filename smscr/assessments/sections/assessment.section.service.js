import CustomError from "../../../utils/custom-error.js";
import AssessmentSection from "./assessment.section.schema.js";
import { sanitizeHTML } from "../../../utils/sanitize-html.js";
import mongoose from "mongoose";

export const create_assessment_section = async data => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const { assessment_id, instruction } = data;
    const cleanInstruction = sanitizeHTML(instruction);

    const assessment_section = await new AssessmentSection({
      assessment: assessment_id,
      instruction: cleanInstruction,
    }).save({ session });

    if (!assessment_section) {
      throw new CustomError("Failed to create a new section.", 500);
    }

    await session.commitTransaction();

    return {
      success: true,
      section: { ...assessment_section._doc, answers: [] },
    };
  } catch (error) {
    await session.abortTransaction();
    throw new CustomError(error.message, error.statusCode || 500);
  } finally {
    session.endSession();
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
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const deleted = await AssessmentSection.findOneAndDelete(
      { _id: id },
      { session }
    ).exec();
    if (!deleted) throw new CustomError("Failed to delete the section.", 500);

    await session.commitTransaction();

    return {
      success: true,
      section: id,
    };
  } catch (error) {
    await session.abortTransaction();
    throw new CustomError(error.message, error.statusCode || 500);
  } finally {
    session.endSession();
  }
};
