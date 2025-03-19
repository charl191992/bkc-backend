import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["schedule request"],
    },
    description: {
      type: String,
      required: true,
    },
    scheduleRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RequestSchedule",
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
