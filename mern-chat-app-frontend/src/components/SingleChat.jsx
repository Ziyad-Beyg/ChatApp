import {
  Box,
  Fade,
  FormControl,
  IconButton,
  Input,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { ChatState } from "../context/ChatContext";
import { ArrowBackIcon } from "@chakra-ui/icons";
import ProfileModal from "./Miscellaneous/ProfileModal";
import { getSenderFull, isUserOnline } from "../utils/ChatLogics";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import ScrollableChat from "./ScrollableChat";
import io from "socket.io-client";
import UserStatus from "./User/UserStatus";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { useRef } from "react";

const ENDPOINT = "http://localhost:8080";
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const {
    selectedChat,
    setSelectedChat,
    user,
    token,
    onlineUsers,
    setOnlineUsers,
    notification,
    setNotification,
  } = ChatState();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isUserSleep, setIsUserSleep] = useState();
  const [receiversSelectedChat, setReceiversSelectedChat] = useState();
  const [fetching, setFetching] = useState(false);
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const pickerRef = useRef(null);

  const fetchMessages = async () => {
    try {
      if (!selectedChat) {
        return false;
      }

      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        const config = {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        };

        socket.emit("userAwake&Fetched");

        if (
          isUserSleep &&
          isUserOnline(user, selectedChat?.users, onlineUsers) === "online" &&
          receiversSelectedChat._id === selectedChat._id
        ) {
          await messageRead();
        } else if (
          !isUserSleep &&
          isUserOnline(user, selectedChat?.users, onlineUsers) === "online"
        ) {
          await messageDeliver();
        } else if (
          isUserOnline(user, selectedChat?.users, onlineUsers) === "offline"
        ) {
          setLoading(true);

          const { data } = await axios.get(
            `http://localhost:8080/api/v1/message/fetch-messages/${selectedChat._id}`,
            config
          );
          setMessages(data?.data);
          setLoading(false);

          socket.emit("joinChat", selectedChat._id);
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
      throw new Error(error);
    } finally {
      setLoading(false);
      setFetching(false);
    }
  };

  const sendMessage = async (event) => {
    try {
      if (event.key === "Enter" && newMessage) {
        socket.emit("stopTyping", selectedChat._id);
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        };

        let messageStatus;

        if (
          isUserSleep &&
          isUserOnline(user, selectedChat?.users, onlineUsers) === "online" &&
          receiversSelectedChat._id === selectedChat._id
        ) {
          messageStatus = "read";
        } else if (
          !isUserSleep &&
          isUserOnline(user, selectedChat?.users, onlineUsers) === "online"
        ) {
          messageStatus = "delivered";
        } else if (
          isUserOnline(user, selectedChat?.users, onlineUsers) === "offline"
        ) {
          messageStatus = "sent";
        }

        setNewMessage("");

        const { data } = await axios.post(
          "http://localhost:8080/api/v1/message/send-message",
          {
            content: newMessage,
            chatId: selectedChat?._id,
            messageStatus: messageStatus,
          },
          config
        );

        setMessages([...messages, data?.data]);
        socket.emit("newMessage", data?.data);

        toast.success("Message Sent");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
      throw new Error(error);
    } finally {
      setLoading(false);
    }
  };

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (newMessage.trim() === "") return;

    if (newMessage.trim() !== "") {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }

    const lastTypingTime = new Date().getTime();
    const timerLength = 3000;
    setTimeout(() => {
      const timeNow = new Date().getTime();
      const timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stopTyping", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  const messageDeliver = async () => {
    if (!selectedChat) return false;
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        const config = {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        };
        const { data } = await axios.put(
          `http://localhost:8080/api/v1/message/deliver-messages/${selectedChat._id}`,
          {},
          config
        );
        setMessages(data?.data);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
      throw new Error(error);
    }
  };

  const messageRead = async () => {
    if (!selectedChat) return false;
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        const config = {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        };
        const { data } = await axios.put(
          `http://localhost:8080/api/v1/message/read-messages/${selectedChat._id}`,
          {},
          config
        );
        setMessages(data?.data);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
      throw new Error(error);
    }
  };

  useEffect(() => {
    const userID = JSON.parse(localStorage.getItem("currentUser"));
    socket = io(ENDPOINT, {
      auth: {
        token: userID._id,
      },
    });
    socket.emit("setup", user);
    socket.on("connected", () => {
      setSocketConnected(true);
    });
    socket.on("typing", () => setIsTyping(true));
    socket.on("stopTyping", () => setIsTyping(false));

    socket.on("userIsSleeping", (userID) => {
      setIsUserSleep();
    });

    socket.on("userIsNotSleeping", (userID) => {
      setIsUserSleep(userID);
    });

    socket.on("onlineUsers", (allOnlineUsers) => {
      setOnlineUsers(allOnlineUsers);
    });

    socket.on("receiversSelectedChat", (chat) => {
      setReceiversSelectedChat(chat);
    });

    return () => {
      socket.disconnect();
      socket.off();
    };
  }, []);

  useEffect(() => {
    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    socket.on("messageReceived", (newMessageReceived) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageReceived.chat._id
      ) {
        if (!notification?.includes(newMessageReceived)) {
          setNotification([newMessageReceived, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages([...messages, newMessageReceived]);
      }
    });
  });

  useEffect(() => {
    if (selectedChat) {
      fetchMessages();
      selectedChatCompare = selectedChat;
      socket.emit("selectedChatsChanged", selectedChat);
    }
  }, [selectedChat, isUserSleep]);

  useEffect(() => {
    if (!selectedChat) {
      socket.emit("userSleeping");
    } else {
      socket.emit("userNotSleeping");
    }
  }, [selectedChat, isUserSleep]);

  const handleEmojiSelect = (emoji) => {
    setNewMessage((prevMessage) => prevMessage + emoji.native);
  };

  const handleClickOutside = (event) => {
    if (pickerRef.current && !pickerRef.current.contains(event.target)) {
      setIsPickerVisible(false);
    }
  };

  useEffect(() => {
    if (isPickerVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPickerVisible]);

  return (
    <>
      {selectedChat ? (
        <>
          <Box
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="Work sans"
            display="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
          >
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => {
                setIsUserSleep();
                setSelectedChat("");
              }}
            />
            {!selectedChat.isGroupChat && (
              <>
                <span style={{ position: "relative" }}>
                  {getSenderFull(user, selectedChat?.users)?.name}
                  <UserStatus />
                </span>
                <ProfileModal user={getSenderFull(user, selectedChat?.users)} />
              </>
            )}
          </Box>
          <Box
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            bg="#E8E8E8"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
                className="messages"
              >
                <ScrollableChat socket={socket} messages={messages} />
              </div>
            )}

            <FormControl
              onKeyDown={sendMessage}
              id="first-name"
              isRequired
              mt={3}
            >
              {isTyping ? (
                <Fade in={isTyping}>
                  <Box color="green">typing...</Box>
                </Fade>
              ) : (
                <></>
              )}
              <Box position={"relative"} display={"flex"} alignItems={"center"}>
                <Input
                  variant="filled"
                  bg="#E0E0E0"
                  pr={10}
                  placeholder="Enter a message.."
                  value={newMessage}
                  onChange={typingHandler}
                />
                <Text
                  fontSize={30}
                  position={"absolute"}
                  right={2}
                  bottom={0.5}
                  cursor={"pointer"}
                  onClick={() => setIsPickerVisible(!isPickerVisible)}
                >
                  ☺️
                </Text>
                <Box
                  ref={pickerRef}
                  display={isPickerVisible ? "block" : "none"}
                  position="absolute"
                  bottom="50px"
                  right="10px"
                  zIndex="10"
                >
                  <Picker
                    data={data}
                    previewPosition={"none"}
                    onEmojiSelect={handleEmojiSelect}
                  />
                </Box>
              </Box>
            </FormControl>
          </Box>
        </>
      ) : (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          h="100%"
        >
          <Text fontSize="3xl" pb={3} fontFamily="Work sans">
            Click on a user to start chatting
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
