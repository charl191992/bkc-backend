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
    requestorType: {
      type: String,
      required: true,
      enum: ["teacher", "student"],
    },
    scheduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Schedule",
      required: true,
    },
    subject: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
        required: false,
      },
    ],
    schedule: {
      start: { type: Date, required: false },
      end: { type: Date, required: false },
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "confirmed", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const RequestSchedule = mongoose.model(
  "RequestSchedule",
  requestScheduleSchema
);

export default RequestSchedule;
