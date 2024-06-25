import { app } from "./app.js";
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import ApiError from "./utils/ApiError.js";
import { createServer } from "http";
import { Server } from "socket.io";

dotenv.config({
  path: "./.env",
});

const port = process.env.PORT || 8080;
const server = createServer(app);
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:5173",
  },
});

connectDB()
  .then(() => {
    server.listen(port, () => {
      console.log(`⚙ Server Running on Port: ${port}`);
    });

    const onlineUsers = new Set();

    io.on("connection", async (socket) => {
      console.log("User Connected");

      const userID = socket.handshake.auth.token;

      if (userID) {
        onlineUsers.add(userID);
      }

      io.emit("onlineUsers", Array.from(onlineUsers));

      socket.on("setup", (userData) => {
        socket.join(userData._id);
        socket.emit("connected");
      });

      socket.on("joinChat", (room) => {
        socket.join(room);
      });

      socket.on("typing", (room) => {
        socket.in(room).emit("typing");
      });

      socket.on("stopTyping", (room) => {
        socket.in(room).emit("stopTyping");
      });

      socket.on("newMessage", (newMessageRecieved) => {
        var chat = newMessageRecieved.chat;

        if (!chat.users) return console.log("Chat.user not defined");

        chat.users.forEach((user) => {
          if (user._id === newMessageRecieved.sender._id) return;

          socket.in(user._id).emit("messageReceived", newMessageRecieved);
        });
      });

      socket.on("userSleeping", () => {
        socket.broadcast.emit("userIsSleeping", userID);
      });

      socket.on("userNotSleeping", () => {
        socket.broadcast.emit("userIsNotSleeping", userID);
      });

      socket.on("selectedChatsChanged", (selectedChats) => {
        if (!selectedChats?.users || selectedChats?.users?.length === 0) {
          return false;
        }
        socket.broadcast.emit("receiversSelectedChat", selectedChats);
      });

      socket.on("userAwake&Fetched", () => {
        socket.broadcast.emit("userFetchedData");
      });

      socket.on("messageDeleted", (messageID) => {
        console.log(`message deleted ${messageID}`);
        socket.broadcast.emit("deletionId", messageID);
      });

      socket.on("disconnect", () => {
        const userID = socket.handshake.auth.token;
        console.log(`User Disconnected: ${userID}`);

        if (userID) {
          onlineUsers.delete(userID);
          io.emit("onlineUsers", Array.from(onlineUsers));
        }
        socket.leave(userID);
      });
    });
  })
  .catch((err) => {
    console.log("DB Connection Failed: ", err);
    throw new ApiError(500, `DB Connection Failed: ${err}`);
  });
