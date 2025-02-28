import mongoose from "mongoose";
import { subjectSchema, daySchema } from "../reusable.schema.js";

const enrollmentSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
    },
    studentDetails: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "UserDetails",
    },
    studentAccount: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    studentAssessments: {
      type: [mongoose.Schema.Types.ObjectId],
      required: false,
      ref: "StudentAssessment",
    },
    education: {
      school: { type: String, required: true },
      grade_level: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Level",
      },
    },
    mode: { type: String, required: true },
    purpose: { type: String, required: true },
    subjects: { type: [subjectSchema], required: true },
    requestedSubjects: { type: [subjectSchema], required: true },
    days: { type: [daySchema], required: true },
    hours_per_session: { type: String, required: true },
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
      enum: [
        "for assessment",
        "active assessment",
        "finished assessment",
        "rejected",
      ],
      default: "for assessment",
    },
  },
  { timestamps: true }
);

const Enrollment = mongoose.model("Enrollment", enrollmentSchema);

export default Enrollment;
