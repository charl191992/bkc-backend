import mongoose from "mongoose";
import { addressSchema, nameSchema } from "../reusable.schema.js";

const relativeSchema = new mongoose.Schema(
  {
    parent_name: { type: String, required: false },
    parent_contact: { type: String, required: false },
    parent_email: { type: String, required: false },
  },
  { _id: false }
);

const userDetailsSchema = new mongoose.Schema(
  {
    name: { type: nameSchema },
    gender: { type: String, enum: ["male", "female"], required: false },
    birthdate: { type: Date, required: false },
    contact: { type: String, required: false },
    nationality: { type: String, required: false },
    address: { type: String, required: false },
    country: { type: String, required: true },
    marital_status: { type: String, required: false },
    guardian: { type: relativeSchema, required: false },
    timezone: { type: String, required: true },
  },
  { _id: false }
);

export default userDetailsSchema;
