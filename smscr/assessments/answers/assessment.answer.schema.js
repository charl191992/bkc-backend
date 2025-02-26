import mongoose from "mongoose";

const assessmentAnswerSchema = new mongoose.Schema(
  {
    assessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assessment",
      required: true,
    },
    assessment_section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AssessmentSection",
      required: true,
    },
    answer: { type: String, required: true },
    deletedAt: { type: String, required: false },
  },
  { timestamps: true }
);

const AssessmentAnswer = mongoose.model(
  "AssessmentAnswer",
  assessmentAnswerSchema
);

export default AssessmentAnswer;
