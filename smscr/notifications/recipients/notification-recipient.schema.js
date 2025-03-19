import mongoose from "mongoose";

const notificationRecipientSchema = new mongoose.Schema(
  {
    notification: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Notification",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isRead: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true }
);

const NotificationRecipient = mongoose.model(
  "NotificationRecipient",
  notificationRecipientSchema
);

export default NotificationRecipient;
