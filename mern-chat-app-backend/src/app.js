import express from "express";
import cors from "cors";

export const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.subscribe(express.static("public"));

// API Routes
app.get("/api/v1", (_, res) => {
  console.log("Running");
  res.send("API RUNNING!!!");
});

import userRouter from "./routes/user.route.js";
import chatRouter from "./routes/chat.route.js";
import messageRouter from "./routes/message.route.js";

app.use("/api/v1/user", userRouter);
app.use("/api/v1/chat", chatRouter);
app.use("/api/v1/message", messageRouter);
