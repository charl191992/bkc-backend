import CustomError from "../utils/custom-error.js";

const socket = io => {
  io.on("connection", socket => {
    console.log("JOIN", socket);

    socket.on("disconnect", () => {});
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
