import mongoose from "mongoose";

const requestedEducationLevelSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reason: { type: String },
  },
  { timestamps: true }
);

const RequestedEducationLevel = mongoose.model(
  "RequestedEducationLevel",
  requestedEducationLevelSchema
);

export default RequestedEducationLevel;
