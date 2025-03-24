import mongoose from "mongoose";

const calendarSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["class", "meeting"],
      required: true,
    },
    schedule: {
      start: { type: Date, required: true },
      end: { type: Date, required: true },
    },
    classroom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Classroom",
    },
    meetingroom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MeetingRoom",
    },
  },
  { timestamps: true }
);

const Calendar = mongoose.model("Calendar", calendarSchema);

export default Calendar;
