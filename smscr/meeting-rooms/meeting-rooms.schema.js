import mongoose from "mongoose";

const meetingRoomSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    agenda: {
      type: String,
      required: true,
    },
    schedule: {
      start: { type: Date, required: true },
      end: { type: Date, required: true },
    },
  },
  { timestamps: true }
);

const MeetingRoom = mongoose.model("MeetingRoom", meetingRoomSchema);

export default MeetingRoom;
