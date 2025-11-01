import * as InterviewService from "../../smscr/interviews/interview.service.js";

export const interviewSocket = (socket, io) => {
  socket.on("join-interview-room", async (roomId, peerId) => {
    socket.join(roomId);
    const interview = await InterviewService.add_interview_members(roomId, peerId);
    io.to(roomId).emit("peer-joined", interview.members);
  });

  socket.on("leave-interview-room", (roomId, peerId) => {
    io.to(roomId).emit("peer-left", peerId);
  });
};
