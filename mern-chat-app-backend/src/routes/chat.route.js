import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { accessChat, fetchChats } from "../controllers/chat.controller.js";

const router = express.Router();

router.route("/").post(verifyJWT, accessChat);
router.route("/fetch-chats").get(verifyJWT, fetchChats);

export default router;
