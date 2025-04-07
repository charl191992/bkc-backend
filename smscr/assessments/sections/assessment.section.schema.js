import mongoose from "mongoose";
import Assessment from "../assessment.schema.js";
import CustomError from "../../../utils/custom-error.js";

const assessmentSectionSchema = new mongoose.Schema(
  {
    assessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assessment",
      required: true,
    },
    instruction: { type: String, required: true },
    questions: [
      { type: mongoose.Schema.Types.ObjectId, ref: "AssessmentQuestion" },
    ],
    deletedAt: { type: String, required: false },
  },
  { timestamps: true }
);

assessmentSectionSchema.pre("save", async function () {
  const session = this.$session();
  if (!session) {
    throw new CustomError("Session is required", 500);
  }

  try {
    const updated = await Assessment.updateOne(
      { _id: this.assessment, sections: { $ne: this._id } },
      { $push: { sections: this._id } },
      { session }
    );

    if (updated.modifiedCount < 1) {
      throw new CustomError("Failed to create a new section.", 500);
    }
  } catch (error) {
    throw new CustomError(
      error.message || "Failed to create a new section.",
      error.statusCode || 500
    );
  }
});

assessmentSectionSchema.pre("findOneAndDelete", async function () {
  const session = this.getOptions().session;
  if (!session) {
    throw new CustomError("Session is required", 500);
  }

  try {
    const section = await this.model.findOne(this.getFilter()).session(session);
    if (!section) {
      throw new CustomError("Section not found", 404);
    }

    const updated = await Assessment.updateOne(
      { _id: section.assessment },
      { $pull: { sections: section._id } }
    )
      .session(session)
      .exec();

    if (updated.modifiedCount < 1) {
      throw new CustomError("Failed to delete the section.", 500);
    }
  } catch (error) {
    throw new CustomError(
      error.message || "Failed to delete the section.",
      error.statusCode || 500
    );
  }
});

const AssessmentSection = mongoose.model(
  "AssessmentSection",
  assessmentSectionSchema
);

export default AssessmentSection;
