import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
        required: false,
      },
    ],
    description: {
      type: String,
      required: false,
    },
    ownerRole: {
      type: String,
      required: true,
      enum: ["teacher", "student"],
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
