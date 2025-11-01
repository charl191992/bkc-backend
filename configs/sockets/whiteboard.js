export const whiteboardSocket = (socket, io) => {
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

  socket.on("object:added", data => {
    socket.broadcast.emit("object:added", data);
  });

  socket.on("object:modified", data => {
    socket.broadcast.emit("object:modified", data);
  });

  socket.on("object:removed", data => {
    socket.broadcast.emit("object:removed", data);
  });
};
