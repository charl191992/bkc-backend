export const fileboardSocket = (socket, io) => {
  socket.on("join-fileboard", (roomId, username) => {
    socket.join(roomId);
    io.to(roomId).emit("user-joined-fileboard", username);
  });

  socket.on("load-file", roomId => {
    socket.to(roomId).emit("load-file");
  });

  socket.on("draw-highlight", (roomId, strokeData) => {
    console.log(roomId, strokeData);
    socket.to(roomId).emit("draw-highlight", strokeData);
  });

  socket.on("leave-whiteboard", (roomId, username) => {
    io.to(roomId).emit("user-leave-whiteboard", username);
  });
};
