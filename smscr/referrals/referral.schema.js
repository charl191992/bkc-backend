import mongoose from "mongoose";

const referralSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique },
    count: { type: Number, required: false, default: 0 },
  },
  { timestamps: true }
);

const Referral = mongoose.model("Referral", referralSchema);

export default Referral;
