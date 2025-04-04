import mongoose from "mongoose";

const languageSchema = new mongoose.Schema(
  { name: { type: String, required: true, unique: true } },
  { timestamps: true }
);

const Language = mongoose.model("Language", languageSchema);

export default Language;
