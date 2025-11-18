import * as ScheduleDateService from "../../smscr/schedule-dates/schedule-date.service.js";

export const classroomSocket = (socket, io) => {
  socket.on("join-class-room", async (roomId, userId) => {
    socket.join(roomId);

    const joinedUsers = await ScheduleDateService.user_joined_classroom(roomId, userId);

    socket.to(roomId).emit("user-joined-classroom", userId);
    socket.to(roomId).emit("current-users", joinedUsers);
  });

  socket.on("user-send-message", async (roomId, name, message) => {
    io.in(roomId).emit("user-sent-message", { name, message });
  });

  socket.on("leave-class-room", async (roomId, userId) => {
    io.to(roomId).emit("user-leave-classroom", userId);
  });
};
