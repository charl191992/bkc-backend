export const fileboardSocket = (socket, io) => {
  socket.on("join-whiteboard", async (roomId, username) => {
    socket.join(roomId);
    io.to(roomId).emit("user-joined-whiteboard", username);
  });

  socket.on("drawing-stroke", async (roomId, strokeData) => {
    console.log(roomId, strokeData);
    socket.to(roomId).emit("drawing-stroke", strokeData);
  });

  socket.on("leave-whiteboard", async (roomId, username) => {
    io.to(roomId).emit("user-leave-whiteboard", username);
  });
};
