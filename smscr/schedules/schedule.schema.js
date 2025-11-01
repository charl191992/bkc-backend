import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema(
  {
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    days: [{ type: String, enum: ["monday", "tuesday", "wednesday", "thursday", "friday"] }],
    months: { type: Number },
    subscription_start: { type: Date },
    subscription_end: { type: Date },
    time_start: { type: String },
    time_end: { type: String },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

const Schedule = mongoose.model("Schedule", scheduleSchema);

export default Schedule;
