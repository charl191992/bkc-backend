import mongoose from "mongoose";

const educationLevelSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, unique: true },
    deletedAt: { type: String, required: false },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    deletedAt: { type: String, required: false },
  },
  { timestamps: true }
);

const EducationLevel = mongoose.model("EducationLevel", educationLevelSchema);

export default EducationLevel;
