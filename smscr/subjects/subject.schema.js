import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, unique: true },
    deletedAt: { type: String, required: false },
  },
  { timestamps: true }
);

const Subject = mongoose.model("Subject", subjectSchema);

export default Subject;
