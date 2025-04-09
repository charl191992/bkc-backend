import mongoose from "mongoose";
import AssessmentSection from "../sections/assessment.section.schema.js";
import CustomError from "../../../utils/custom-error.js";

const choiceSchema = new mongoose.Schema({
  text: { type: String, required: false },
  image: {
    filename: { type: String, required: false },
    path: { type: String, required: false },
    original_name: { type: String, required: false },
    size: { type: Number, required: false },
  },
});

const assessmentQuestionSchema = new mongoose.Schema(
  {
    assessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assessment",
      required: true,
    },
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AssessmentSection",
      required: true,
    },
    question: {
      text: { type: String, required: false },
      image: {
        filename: { type: String, required: false },
        path: { type: String, required: false },
        original_name: { type: String, required: false },
        size: { type: Number, required: false },
      },
    },
    choices: [choiceSchema],
    answer: { type: String, required: false },
  },
  { timestamps: true }
);

assessmentQuestionSchema.pre("save", async function () {
  const session = this.$session();
  if (!session) {
    throw new CustomError("Session is required", 500);
  }
  try {
    const updated = await AssessmentSection.updateOne(
      { _id: this.section, questions: { $ne: this._id } },
      { $push: { questions: this._id } },
      { session }
    ).exec();

    if (updated.modifiedCount < 1) {
      throw new CustomError("Failed to add a new question", 500);
    }
  } catch (error) {
    throw new CustomError(
      error.message || "Failed to add a new question",
      error.statusCode || 500
    );
  }
});

assessmentQuestionSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function () {
    const session = this.$session();
    if (!session) {
      throw new CustomError("Session is required", 500);
    }
    try {
      const sectionContainsQuestion = await AssessmentSection.exists({
        _id: this.section,
        questions: this._id,
      }).session(session);

      if (!sectionContainsQuestion) {
        throw new CustomError("Question not found", 404);
      }

      const updated = await AssessmentSection.updateOne(
        { _id: this.section },
        { $pull: { questions: this._id } },
        { session }
      ).exec();

      if (updated.modifiedCount === 0) {
        throw new CustomError("Failed to delete the question", 500);
      }
    } catch (error) {
      throw new CustomError(
        error.message || "Failed to delete the question",
        error.statusCode || 500
      );
    }
  }
);

const AssessmentQuestion = mongoose.model(
  "AssessmentQuestion",
  assessmentQuestionSchema
);

export default AssessmentQuestion;
