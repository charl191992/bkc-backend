import mongoose from "mongoose";

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

const AssessmentSection = mongoose.model(
  "AssessmentSection",
  assessmentSectionSchema
);

export default AssessmentSection;
