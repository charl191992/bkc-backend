import CustomError from "../utils/custom-error.js";
import * as InterviewService from "../smscr/interviews/interview.service.js";

const socket = io => {
  io.on("connection", socket => {
    socket.on("join-interview-room", async (roomId, peerId) => {
      socket.join(roomId);
      const interview = await InterviewService.add_interview_members(
        roomId,
        peerId
      );
      io.to(roomId).emit("peer-joined", interview.members);
    });

    socket.on("leave-interview-room", (roomId, peerId) => {
      io.to(roomId).emit("peer-left", peerId);
    });

    socket.on("disconnect", () => {});

    socket.on("signal", data => {
      io.to(data.target).emit("signal", data);
    });
  });
};

let ioInstance = null;

export const initializeSocket = io => {
  if (!ioInstance) ioInstance = io;
};

export const getIOInstance = () => {
  if (!ioInstance) throw new CustomError("No Available Websocket!", 500);
  return ioInstance;
};

export default socket;
