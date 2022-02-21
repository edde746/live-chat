import { Server } from "socket.io";

export default function handler(req, res) {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server);

    io.on("connection", (socket) => {
      let username;

      socket.on("name", (msg) => {
        username = msg;
        socket.broadcast.emit("message", { event: "join", username });
      });

      socket.on("message", (content) => {
        socket.broadcast.emit("message", { content, username });
      });

      socket.on("disconnect", () => {
        socket.broadcast.emit("message", { event: "leave", username });
      });
    });

    res.socket.server.io = io;
  }
  res.end();
}

export const config = {
  api: {
    bodyParser: false,
  },
};
