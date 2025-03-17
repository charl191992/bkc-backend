import mongoose from "mongoose";

const classroomSchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: ["pending", "ongoing", "ended"],
      required: true,
    },
  },
  { timestamps: true }
);

const Classroom = mongoose.model("Classroom", classroomSchema);

export default Classroom;
