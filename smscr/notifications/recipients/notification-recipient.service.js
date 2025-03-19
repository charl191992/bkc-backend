import CustomError from "../../../utils/custom-error.js";
import NotificationRecipient from "./notification-recipient.schema.js";

export const create_recipient = async (data, session) =>
  await new NotificationRecipient({
    notification: data.notification,
    user: data.user,
    isRead: false,
  }).save({ session });
