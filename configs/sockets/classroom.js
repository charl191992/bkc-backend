export const classroomSocket = (socket, io) => {
  socket.on("join-class-room", async (roomId, username) => {
    socket.join(roomId);
    socket.to(roomId).emit("user-joined-classroom", username);
  });

  socket.on("user-send-message", async (roomId, name, message) => {
    io.in(roomId).emit("user-sent-message", { name, message });
  });

  socket.on("leave-class-room", async (roomId, username) => {
    io.to(roomId).emit("user-leave-classroom", username);
  });
};
