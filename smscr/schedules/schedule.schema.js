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
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
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
    status: {
      type: String,
      required: true,
      enum: ["available", "ended"],
    },
    dateTime: {
      start: { type: Date, required: true },
      end: { type: Date, required: true },
    },
    classroom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Classroom",
      required: false,
    },
    timezone: { type: String, required: true },
  },
  { timestamps: true }
);

const Schedule = mongoose.model("Schedule", scheduleSchema);

export default Schedule;
