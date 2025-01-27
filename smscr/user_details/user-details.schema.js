import mongoose from "mongoose";
import { addressSchema, nameSchema } from "../reusable.schema.js";

const relativeSchema = new mongoose.Schema(
  {
    father_name: { type: String, required: false },
    father_contact: { type: String, required: false },
    mother_name: { type: String, required: false },
    mother_contact: { type: String, required: false },
    guardian_name: { type: String, required: false },
    guardian_contact: { type: String, required: false },
  },
  { _id: false }
);

const userDetailsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    name: { type: nameSchema },
    gender: { type: String, enum: ["male", "female"], required: false },
    birthdate: { type: Date, required: false },
    contact: { type: String, required: false },
    nationality: { type: String, required: false },
    address: { type: addressSchema },
    marital_status: { type: String, required: false },
    relatives: { type: relativeSchema, required: false },
  },
  { timestamps: true }
);

const UserDetails = mongoose.model("UserDetails", userDetailsSchema);

export default UserDetails;
