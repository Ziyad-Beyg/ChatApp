import AsyncHandler from "../utils/AsyncHandler.js";
import { Message } from "../models/messages.model.js";
import { Chat } from "../models/chats.model.js";
import { User } from "../models/users.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

const fetchAllMessages = AsyncHandler(async (req, res) => {
  try {
    const chatId = req.params.chatId;
    if (!chatId) {
      throw new ApiError(401, "Invalid Chat ID");
    }
    const messages = await Message.find({ chat: chatId })
      .populate("sender", "name userPic email isOnline")
      .populate("chat");
    return res
      .status(200)
      .json(new ApiResponse(200, messages, "All Messages Fetched"));
  } catch (error) {
    console.log(error);
    throw new ApiError(400, error.message);
  }
});

const sendMessage = AsyncHandler(async (req, res) => {
  const { content, chatId, messageStatus } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    throw new ApiError(400, "Invalid data passed into request");
  }

  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
    messageStatus: messageStatus,
  };

  try {
    var message = await Message.create(newMessage);

    message = await message.populate("sender", "name userPic");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name userPic email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    return res
      .status(201)
      .json(new ApiResponse(201, message, "Message sent successfully"));
  } catch (error) {
    throw new ApiError(400, error.message);
  }
});

const deliverMessage = AsyncHandler(async (req, res) => {
  try {
    const chatId = req.params.chatId;

    if (!chatId) {
      throw new ApiError(401, "Invalid Chat ID");
    }
    const messagesDelivered = await Message.updateMany(
      { chat: chatId, messageStatus: "sent" },
      { $set: { messageStatus: "delivered" } }
    );

    const allMessages = await Message.find({
      chat: chatId,
    })
      .populate("sender", "name userPic email")
      .populate("chat");

    return res
      .status(200)
      .json(new ApiResponse(200, allMessages, "Messages Delivered"));
  } catch (error) {
    console.log(error);
    throw new ApiError(400, error.message);
  }
});

const readMessage = AsyncHandler(async (req, res) => {
  try {
    const chatId = req.params.chatId;

    if (!chatId) {
      throw new ApiError(401, "Invalid Chat ID");
    }
    const messagesRead = await Message.updateMany(
      { chat: chatId, messageStatus: "delivered" },
      { $set: { messageStatus: "read" } }
    );

    const allMessages = await Message.find({
      chat: chatId,
    })
      .populate("sender", "name userPic email")
      .populate("chat");

    return res
      .status(200)
      .json(new ApiResponse(200, allMessages, "Messages read"));
  } catch (error) {
    console.log(error);
    throw new ApiError(400, error.message);
  }
});

const deleteMessage = AsyncHandler(async (req, res) => {
  try {
    const messageId = req.params.messageId;

    if (!messageId) {
      throw new ApiError(400, "Message ID is required");
    }

    const message = await Message.findByIdAndDelete(messageId);

    if (!message) {
      throw new ApiError(404, "Message not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, message, "Message deleted successfully"));
  } catch (error) {
    console.log(error);
    throw new ApiError(400, error.message);
  }
});

export {
  fetchAllMessages,
  sendMessage,
  deliverMessage,
  readMessage,
  deleteMessage,
};
