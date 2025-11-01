import CustomError from "../utils/custom-error.js";
import { classroomSocket } from "./sockets/classroom.js";
import { whiteboardSocket } from "./sockets/whiteboard.js";
import { fileboardSocket } from "./sockets/fileboard.js";
import { interviewSocket } from "./sockets/interview.js";

const socket = io => {
  io.on("connection", socket => {
    interviewSocket(socket, io);
    classroomSocket(socket, io);
    whiteboardSocket(socket, io);
    fileboardSocket(socket, io);

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
