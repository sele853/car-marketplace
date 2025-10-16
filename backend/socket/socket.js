import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import Message from "../models/message.js";


const setupSocket = (server) => {
  const io = new Server(server, { cors: { origin: "http://localhost:5173/" } });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Authentication error"));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.user.id);

    socket.on("joinChat", (chatRoom) => {
      socket.join(chatRoom);
    });

    socket.on("sendMessage", async (data) => {
      const { receiver, content } = data;
      const chatRoom = [socket.user.id, receiver].sort().join("_");

      const message = new Message({
        sender: socket.user.id,
        receiver,
        content,
        chatRoom,
      });
      await message.save();

      io.to(chatRoom).emit("newMessage", message);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.user.id);
    });
  });

  return io;
};

export default setupSocket;
