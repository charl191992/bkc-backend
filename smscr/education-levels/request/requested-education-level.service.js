import CustomError from "../../../utils/custom-error.js";
import RequestedEducationLevel from "./requested-education-level.schema.js";

export const get_requested_educ_levels = async (
  limit,
  offset,
  page,
  search
) => {
  try {
    const filter = {};
    if (search) filter.label = new RegExp(search, "i");

    const countPromise = RequestedEducationLevel.countDocuments(filter);
    const levelsPromise = RequestedEducationLevel.find(filter)
      .sort({
        createdAt: -1,
      })
      .skip(offset)
      .limit(limit)
      .exec();

    const [count, levels] = await Promise.all([countPromise, levelsPromise]);

    const hasNextPage = count > offset + limit;
    const hasPrevPage = page > 1;
    const totalPages = Math.ceil(count / limit);

    return {
      success: true,
      levels,
      hasNextPage,
      hasPrevPage,
      totalPages,
    };
  } catch (error) {
    throw new CustomError(
      error.message || "Failed to get requested education levels",
      error.statusCode || 500
    );
  }
};

export const change_status = async (user, id, status) => {
  try {
    const filter = { _id: id, status: "pending" };
    const updates = { $set: { status, approver: user._id } };
    const options = {};

    const updated = await RequestedEducationLevel.findByIdAndUpdate(
      filter,
      updates,
      options
    );

    if (!updated) {
      throw new CustomError(
        "Requested Educational Level is not found or already confirmed/rejected",
        400
      );
    }

    if (updated.status === "approved") {
      // Send Approve Email
    }

    if (updated.status === "rejected") {
      // Send Rejection Email
    }
  } catch (error) {
    throw new CustomError(
      error.message ||
        "Failed to change the status of the requested educational level",
      error.statusCode || 500
    );
  }
};
