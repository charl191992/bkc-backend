import mongoose from "mongoose";

const levelSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, unique: true },
    deletedAt: { type: String, required: false },
  },
  { timestamps: true }
);

const Level = mongoose.model("Level", levelSchema);

export default Level;
