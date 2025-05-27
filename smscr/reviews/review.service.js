import CustomError from "../../utils/custom-error.js";
import { stAdmin, suAdmin, teAdmin } from "../../utils/roles.js";
import Review from "./review.schema.js";

export const get_all = async (limit, offset, page, search, status) => {
  let filter = {};
  if (search) filter.reviewer = new RegExp(search, "i");
  if (status !== "all") filter.status = status;

  const countPromise = Review.countDocuments(filter);
  const reviewsPromise = Review.find(filter).sort({ createdAt: -1 }).skip(offset).limit(limit).exec();

  const [count, reviews] = await Promise.all([countPromise, reviewsPromise]);

  const hasNextPage = count > offset + limit;
  const hasPrevPage = page > 1;
  const totalPages = Math.ceil(count / limit);

  return {
    success: true,
    reviews,
    hasNextPage,
    hasPrevPage,
    totalPages,
  };
};

export const create_by_type = async (data, type, role) => {
  const { reviewer, review, ratings } = data;
  const newReview = await new Review({
    type,
    status: "pending",
    reviewer,
    review,
    ratings,
    status: [suAdmin, teAdmin, stAdmin].includes(role) ? "approved" : "pending",
  }).save();

  if (!newReview) throw new CustomError("Failed to create a review", 500);

  return {
    success: true,
    msg: "Successfully created a review.",
  };
};

export const update = async (id, data) => {
  const { review, reviewer, ratings } = data;
  const updated = await Review.findByIdAndUpdate(id, { $set: { review, reviewer, ratings } }, { new: true }).exec();
  if (!updated) {
    throw new CustomError("Failed to updated the review", 500);
  }
  return {
    success: true,
    review: updated,
  };
};

export const change_pinned_status = async (id, isPinned) => {
  const updated = await Review.findByIdAndUpdate(id, { $set: { isPinned } }, { new: true }).exec();
  if (!updated) {
    throw new CustomError("Failed to change the pinned status of the review", 500);
  }
  return {
    success: true,
    review: updated,
  };
};

export const approve = async id => {
  const updated = await Review.findByIdAndUpdate(id, { $set: { status: "approved" } }, { new: true }).exec();
  if (!updated) {
    throw new CustomError("Failed to approve review", 500);
  }
  return {
    success: true,
    review: updated,
  };
};

export const remove = async id => {
  const removed = await Review.deleteOne({ _id: id }).exec();
  if (removed.deletedCount < 1) {
    throw new CustomError("Failed to delete the review", 500);
  }
  return {
    success: true,
    review: id,
  };
};
