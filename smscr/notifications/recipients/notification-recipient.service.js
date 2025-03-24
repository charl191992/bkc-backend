import CustomError from "../../../utils/custom-error.js";
import NotificationRecipient from "./notification-recipient.schema.js";

export const create_recipient = async (data, session) =>
  await new NotificationRecipient({
    notification: data.notification,
    user: data.user,
    isRead: false,
  }).save({ session });

export const get_notifications = async (user, limit, offset, page) => {
  try {
    const filter = { user: user._id };

    const isReadCountPromise = NotificationRecipient.countDocuments({
      ...filter,
      isRead: false,
    });
    const countPromise = NotificationRecipient.countDocuments(filter);
    const notificationsPromise = NotificationRecipient.find(filter)
      .select("-__v -updatedAt -user -createdAt")
      .populate({
        path: "notification",
        select: "-updatedAt -__v -_id",
        populate: [
          {
            path: "initiator",
            select: "display_image details.name.fullname -_id",
          },
          {
            path: "scheduleRequest",
            select: "description schedule status subject",
            populate: {
              path: "subject",
              select: "label -_id",
            },
          },
        ],
      })
      .sort({
        createdAt: -1,
      })
      .skip(offset)
      .limit(limit)
      .exec();

    const [unreadCount, count, notifications] = await Promise.all([
      isReadCountPromise,
      countPromise,
      notificationsPromise,
    ]);

    const hasNextPage = count > offset + limit;
    const hasPrevPage = page > 1;
    const totalPages = Math.ceil(count / limit);

    return {
      success: true,
      notifications,
      hasNextPage,
      hasPrevPage,
      totalPages,
      unreads: unreadCount,
    };
  } catch (error) {
    throw new CustomError(
      error.message || "Failed to get notifications",
      error.statusCode || 500
    );
  }
};

export const mark_as_read = async (id, user) => {
  try {
    const filter = { _id: id, user: user._id, isRead: false };

    const unreads = await NotificationRecipient.updateOne(filter, {
      $set: { isRead: true },
    }).exec();
    console.log(unreads);
    if (unreads.modifiedCount < 1)
      throw new CustomError("Failed to mark as read", 500);

    return {
      success: true,
      unread: id,
    };
  } catch (error) {
    throw new CustomError(
      error.message || "Failed to mark as read",
      error.statusCode || 500
    );
  }
};

export const mark_all_as_read = async user => {
  try {
    const filter = { user: user._id, isRead: false };

    const unreads = await NotificationRecipient.updateMany(filter, {
      $set: { isRead: true },
    }).exec();
    if (unreads.modifiedCount !== unreads.matchedCount)
      throw new CustomError("Failed to mark all as read", 500);

    return {
      success: true,
      count: unreads.modifiedCount,
    };
  } catch (error) {
    throw new CustomError(
      error.message || "Failed to mark all as read",
      error.statusCode || 500
    );
  }
};
