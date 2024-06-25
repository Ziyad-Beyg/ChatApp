import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import AsyncHandler from "../utils/AsyncHandler.js";
import { Chat } from "../models/chats.model.js";
import { User } from "../models/users.model.js";

const accessChat = AsyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    throw new ApiError(404, "No userId found");
  }

  let isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name userPic email",
  });

  if (isChat.length > 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, isChat[0], "Chat retrieved"));
  } else {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    const createdChat = await Chat.create(chatData);

    const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
      "users",
      "-password"
    );
    res.status(200).json(new ApiResponse(200, FullChat, "Full chat retrieved"));
  }
});

const fetchChats = AsyncHandler(async (req, res) => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "name userPic email",
        });
        return res
          .status(200)
          .json(new ApiResponse(200, results, "Chats fetched"));
      });
  } catch (error) {
    console.log("My error=>", error);
    throw new ApiError(
      400,
      error.message || "Something went wrong while fetching chats"
    );
  }
});

export { accessChat, fetchChats };
