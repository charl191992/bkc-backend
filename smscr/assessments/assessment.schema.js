import mongoose from "mongoose";

const assessmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    country: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Country",
    },
    level: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Level",
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Subject",
    },
    document: {
      path: { type: String, required: true },
      original_name: { type: String, required: true },
      name: { type: String, required: true },
      type: { type: String, required: true },
    },
    status: {
      type: String,
      enum: ["draft", "completed"],
      required: true,
      default: "draft",
    },
    deletedAt: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

const Assessment = mongoose.model("Assessment", assessmentSchema);

export default Assessment;
