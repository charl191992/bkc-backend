import mongoose from "mongoose";
import { subjectSchema } from "../reusable.schema";

const dayEnrolled = new mongoose.Schema({
  day: { type: String, required: true },
});

const enrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    education: {
      school: { type: String, required: true },
      grade_level: { type: String, required: true },
    },
    mode: { type: String, required: true },
    purpose: { type: String, required: true },
    report_card: { type: String, required: true },
    subjects: { type: [subjectSchema], required: true },
    days: { type: [dayEnrolled], required: true },
    hours_per_session: { type: String, required: true },
    proof_of_payment: { type: String, required: true },
  },
  { timestamps: true }
);

const Enrollment = mongoose.model("Enrollment", enrollmentSchema);

export default Enrollment;
