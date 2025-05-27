import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["public", "teacher"] },
    status: { type: String, enum: ["approved", "pending"] },
    isPinned: { type: Boolean, default: false },
    reviewer: { type: String },
    ratings: { type: Number },
    review: { type: String },
  },
  { timestamps: true }
);

reviewSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.updatedAt;
    delete ret.__v;
    return ret;
  },
});

const Review = mongoose.model("Review", reviewSchema);

export default Review;
