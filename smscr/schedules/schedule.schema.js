import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    requestedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    userType: {
      type: String,
      required: true,
      enum: ["teacher", "student", "meeting"],
    },
    type: {
      type: String,
      required: true,
      enum: ["class", "meeting"],
    },
    ownership: {
      type: String,
      required: true,
      enum: ["owned", "requested"],
    },
    status: {
      type: String,
      required: true,
      enum: ["available", "confirmed", "rejected"],
    },
    dateTime: {
      start: { type: Date, required: true },
      end: { type: Date, required: true },
    },
    timezone: { type: String, required: true },
    lockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    lockedAt: { type: Date, required: false },
    confirmedAt: { type: Date, required: false },
  },
  { timestamps: true }
);

const Schedule = mongoose.model("Schedule", scheduleSchema);

export default Schedule;
