import mongoose from "mongoose";

const supportSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

const Support = mongoose.model("Support", supportSchema);

export default Support;
