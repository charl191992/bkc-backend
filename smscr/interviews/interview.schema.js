import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
    },
    interviewer: {
      type: String,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "cancelled"],
      required: true,
      default: "active",
    },
    date: {
      type: Date,
      required: true,
    },
    start: {
      type: String,
      required: true,
    },
    end: {
      type: String,
      required: true,
    },
    members: {
      type: [String],
      required: false,
      default: [],
    },
  },
  { timestamps: true }
);

const Interview = mongoose.model("Interview", interviewSchema);

export default Interview;
