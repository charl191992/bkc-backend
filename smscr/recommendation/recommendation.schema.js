import mongoose from "mongoose";

const recommendationSchema = new mongoose.Schema(
  {
    enrollment: { type: mongoose.Schema.Types.ObjectId, ref: "Enrollment" },
    recommendation: { type: String },
    schedule: {
      days: [{ type: String, enum: ["monday", "tuesday", "wednesday", "thursday", "friday"] }],
      time_start: { type: String },
      time_end: { type: String },
    },
    recommendedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

recommendationSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.updatedAt;
    delete ret.__v;
    return ret;
  },
});

const Recommendation = mongoose.model("Recommendation", recommendationSchema);

export default Recommendation;
