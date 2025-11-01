import mongoose from "mongoose";

const scheduleDateSchema = new mongoose.Schema(
  {
    scheduleDetails: { type: mongoose.Schema.Types.ObjectId, ref: "Schedule", required: true },
    date: { type: Date, required: true, required: true },
    time_start: { type: String },
    time_end: { type: String },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
    subjects: [{ type: String }],
    status: { type: String, enum: ["pending", "ongoing", "ended"], default: "pending", required: true },
  },
  { timestamps: true }
);

scheduleDateSchema.set("toJSON", {
  transform: (ret, doc) => {
    delete ret.updatedAt;
    delete ret.__v;
    return ret;
  },
});

const ScheduleDate = mongoose.model("ScheduleDate", scheduleDateSchema);

export default ScheduleDate;
