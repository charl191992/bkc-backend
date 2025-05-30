import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, unique: true },
    status: {
      type: String,
      required: true,
      enum: ["active", "inactive"],
      default: "active",
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    deletedAt: { type: String, required: false },
  },
  { timestamps: true }
);

const Subject = mongoose.model("Subject", subjectSchema);

export default Subject;
