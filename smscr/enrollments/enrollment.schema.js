import mongoose from "mongoose";
import { subjectSchema, daySchema } from "../reusable.schema.js";

const enrollmentSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    education: {
      school: { type: String, required: true },
      grade_level: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: "EducationLevel",
      },
      requested_level: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: "RequestedEducationLevel",
      },
    },
    mode: { type: String, required: true },
    purpose: { type: String, required: true },
    subjects: { type: [subjectSchema], required: true },
    requestedSubjects: { type: [subjectSchema], required: true },
    days: { type: [daySchema], required: true },
    time_start: { type: String, required: true },
    time_end: { type: String, required: true },
    report_card: {
      original_name: { type: String, required: true },
      path: { type: String, required: true },
    },
    proof_of_payment: {
      original_name: { type: String, required: true },
      path: { type: String, required: true },
    },
    status: {
      type: String,
      required: true,
      enum: ["for assessment", "rejected", "approved"],
      default: "for assessment",
    },
  },
  { timestamps: true }
);

const Enrollment = mongoose.model("Enrollment", enrollmentSchema);

export default Enrollment;
