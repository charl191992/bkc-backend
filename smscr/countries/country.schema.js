import mongoose from "mongoose";

const countrySchema = new mongoose.Schema(
  {
    label: { type: String, required: true, unique: true },
    timezone: { type: String, required: true },
    deletedAt: { type: String, required: false },
  },
  { timestamps: true }
);

const Country = mongoose.model("Country", countrySchema);

export default Country;
