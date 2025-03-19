import Notification from "./notification.schema.js";
import { create_recipient } from "./recipients/notification-recipient.service.js";

export const create_request_schedule_notif = async (data, session) => {
  const notifDescription = requestScheduleDescription(
    data.requestorName,
    data.status
  );

  const notif = await new Notification({
    type: "schedule request",
    description: notifDescription,
    scheduleRequest: data.requestSchedId,
  }).save({ session });
  if (!notif) throw new CustomError("Failed to notify the requestor", 500);

  const recipient = await create_recipient(
    {
      notification: notif._id,
      user: data.requestor,
    },
    session
  );
  if (!recipient) throw new CustomError("Failed to notify the requestor", 500);
};
