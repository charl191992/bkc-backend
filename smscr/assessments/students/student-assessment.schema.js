import mongoose from "mongoose";

const studentChoiceSchema = new mongoose.Schema({
  text: { type: String, required: false },
  image: {
    filename: { type: String, required: false },
    path: { type: String, required: false },
    original_name: { type: String, required: false },
    size: { type: Number, required: false },
  },
});

const studentAssessmentSectionQuestionSchema = new mongoose.Schema({
  question: {
    text: { type: String, required: false },
    image: {
      filename: { type: String, required: false },
      path: { type: String, required: false },
      original_name: { type: String, required: false },
      size: { type: Number, required: false },
    },
  },
  choices: [studentChoiceSchema],
  answer: { type: String, required: false },
  studentAnswer: { type: String, required: false },
});

const studentAssessmentSectionSchema = new mongoose.Schema({
  instruction: { type: String, required: true },
  questions: [studentAssessmentSectionQuestionSchema],
});

const studentAssessmentSchema = new mongoose.Schema(
  {
    enrollment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Enrollment",
      required: true,
    },
    assessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assessment",
      required: true,
    },
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ["multiple choice", "short answer"],
      required: true,
    },
    level: {
      id: { type: mongoose.Schema.Types.ObjectId, required: true },
      name: { type: String, required: true },
    },
    subject: {
      id: { type: mongoose.Schema.Types.ObjectId, required: true },
      name: { type: String, required: true },
    },
    sections: [studentAssessmentSectionSchema],
    code: { type: Number, required: true },
    taken: { type: Boolean, default: false },
    duration: {
      start: { type: Date },
      end: { type: Date },
    },
  },
  { timestamps: true }
);

const StudentAssessment = mongoose.model("StudentAssessment", studentAssessmentSchema);

export default StudentAssessment;
