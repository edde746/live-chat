import { Server } from "socket.io";
let usernames = {};

export default function handler(req, res) {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server);

    io.on("connection", (socket) => {
      socket.on("name", (msg) => {
        const countOfNames = Object.values(usernames).filter((username) => username == msg).length;
        usernames[socket.id] = countOfNames ? `${msg}-${countOfNames}` : msg;
        socket.emit("username", usernames[socket.id]);
        socket.broadcast.emit("message", { event: "join", username: msg });
      });

      socket.on("message", (content) => {
        if (!usernames[socket.id]) return;
        socket.broadcast.emit("message", { content, username: usernames[socket.id] });
      });

      socket.on("disconnect", () => {
        socket.broadcast.emit("message", { event: "leave", username: usernames[socket.id] });
        usernames[socket.id] = undefined;
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
