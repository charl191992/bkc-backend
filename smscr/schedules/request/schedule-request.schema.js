import mongoose from "mongoose";

const requestScheduleSchema = new mongoose.Schema(
  {
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    requestedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    schedule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Schedule",
      required: true,
    },
    requestorType: {
      type: String,
      required: true,
      enum: ["teacher", "student"],
    },
    haveChanges: {
      type: Boolean,
      required: true,
      default: false,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "confirmed", "rejected"],
      default: "pending",
    },
    scheduleChanges: {
      start: { type: Date, required: false },
      end: { type: Date, required: false },
    },
  },
  { timestamps: true }
);

const RequestSchedule = mongoose.model(
  "RequestSchedule",
  requestScheduleSchema
);

export default RequestSchedule;
