import mongoose from "mongoose";

const studentAnswerSchema = new mongoose.Schema(
  {
    assessmentAnswerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "AssessmentAnswer",
    },
    assessmentAnswer: { type: String, required: true },
    studentAnswer: { type: String, required: true },
  },
  { _id: false }
);

const studentAssessmentSchema = new mongoose.Schema(
  {
    enrollment: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Enrollment",
    },
    assessment: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Assessment",
    },
    answered: { type: Boolean, required: true, default: false },
    answers: {
      type: [studentAnswerSchema],
      required: false,
    },
    duration: {
      start: { type: String, required: false },
      end: { type: String, required: false },
      minutes: { type: String, required: false },
    },
    expiresIn: {
      type: Date,
      required: true,
    },
    deletedAt: { type: String, required: false },
  },
  { timestamps: true }
);

const StudentAssessment = mongoose.model(
  "StudentAssessment",
  studentAssessmentSchema
);

export default StudentAssessment;
