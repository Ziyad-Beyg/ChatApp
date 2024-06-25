import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

import {
  sendMessage,
  fetchAllMessages,
  deliverMessage,
  readMessage,
  deleteMessage,
} from "../controllers/message.controller.js";

const router = express.Router();

router.route("/send-message").post(verifyJWT, sendMessage);
router.route("/fetch-messages/:chatId").get(verifyJWT, fetchAllMessages);
router.route("/deliver-messages/:chatId").put(verifyJWT, deliverMessage);
router.route("/read-messages/:chatId").put(verifyJWT, readMessage);
router.route("/delete-message/:messageId").delete(verifyJWT, deleteMessage);

export default router;
