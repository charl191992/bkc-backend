import { DateTime } from "luxon";
import mongoose from "mongoose";

const assessmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    level: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "EducationLevel",
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Subject",
    },
    country: { type: String, required: true },
    type: {
      type: String,
      enum: ["multiple choice", "short answer"],
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "completed"],
      required: true,
      default: "draft",
    },
    sections: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AssessmentSection",
      },
    ],
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    deletedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

assessmentSchema.methods.sofDelete = function (userId) {
  this.deletedAt = DateTime.now().toUTC();
  this.deletedBy = userId;
  return this.save();
};

const Assessment = mongoose.model("Assessment", assessmentSchema);

export default Assessment;
