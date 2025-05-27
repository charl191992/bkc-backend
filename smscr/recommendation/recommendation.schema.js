import mongoose from "mongoose";

const recommendationSchema = new mongoose.Schema(
  {
    enrollment: { type: mongoose.Schema.Types.ObjectId, ref: "Enrollment" },
    doc: { type: String },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

const Recommendation = mongoose.model("Recommendation", recommendationSchema);

export default Recommendation;
