import mongoose from "mongoose";
import {
  countrySchema,
  daySchema,
  equipmentSchema,
  nameSchema,
  subjectSchema,
} from "../reusable.schema.js";

const applicationSchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: false,
    },
    email: { type: String, required: true },
    name: { type: nameSchema, required: true },
    country: { type: countrySchema, required: true },
    subjects: { type: [subjectSchema], required: true },
    days: { type: [daySchema], required: true },
    session_per_day: { type: Number, required: true },
    hours_per_session: { type: Number, required: true },
    equipment: { type: equipmentSchema, required: true },
    cv_link: { type: String, required: true },
    introduction_link: { type: String, required: true },
    status: {
      type: String,
      enum: ["for-review", "for-interview", "for-final"],
      default: "for-review",
      required: true,
    },
  },
  { timestamps: true }
);

const Application = mongoose.model("Application", applicationSchema);

export default Application;
