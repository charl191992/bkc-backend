import mongoose from "mongoose";
import {
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
    country: { type: String, required: true },
    subjects: { type: [subjectSchema], required: true },
    days: { type: [daySchema], required: true },
    hours_per_session: { type: Number, required: true },
    equipment: { type: equipmentSchema, required: true },
    cv_link: { type: String, required: true },
    introduction_link: { type: String, required: true },
    status: {
      type: String,
      enum: [
        "for-review",
        "for-interview",
        "for-final",
        "rejected",
        "approved",
      ],
      default: "for-review",
      required: true,
    },
    interview: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interview",
      required: false,
    },
    timezone: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Application = mongoose.model("Application", applicationSchema);

export default Application;
