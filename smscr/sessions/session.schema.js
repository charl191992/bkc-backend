import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "User",
    },
    enrollment: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "Enrollment",
    },
    access: { type: String, required: false },
    refresh: { type: String, required: false },
    expiresIn: { type: Date, required: true },
    type: {
      type: String,
      enum: ["user", "assessment"],
      default: "user",
      required: true,
    },
  },
  { timestamps: true }
);

const Session = mongoose.model("Session", sessionSchema);

export default Session;
