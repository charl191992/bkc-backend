import mongoose from "mongoose";

const classroomLogSchema = new mongoose.Schema(
  {
    classroom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Classroom",
      required: true,
    },
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    actions: {
      type: String,
      enum: ["enter", "leave"],
      required: true,
    },
  },
  { timestamps: true }
);

const ClassroomLog = mongoose.model("ClassroomLog", classroomLogSchema);

export default ClassroomLog;
