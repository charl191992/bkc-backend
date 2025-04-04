import CustomError from "../../../utils/custom-error.js";
import AssessmentSection from "./assessment.section.schema.js";
import AssessmentAnswer from "../answers/assessment.answer.schema.js";
import { sanitizeHTML } from "../../../utils/sanitize-html.js";
import mongoose from "mongoose";
import Assessment from "../assessment.schema.js";

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

    const updateSectionList = await Assessment.updateOne(
      { _id: assessment_section.assessment },
      { $push: { sections: assessment_section._id } }
    ).session(session);

    if (updateSectionList.modifiedCount < 1) {
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
    const deleted = await AssessmentSection.findByIdAndDelete(id)
      .session(session)
      .exec();
    if (!deleted) throw new CustomError("Failed to delete the section.", 500);

    const updated = await Assessment.updateOne(
      { _id: deleted.assessment },
      { $pull: { sections: deleted._id } }
    )
      .session(session)
      .exec();
    if (updated.modifiedCount < 1) {
      throw new CustomError("Failed to delete the section", 500);
    }

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
