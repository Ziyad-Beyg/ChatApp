import { Box, Stack, Text } from "@chakra-ui/layout";
import axios from "axios";
import { useEffect, useState } from "react";
import ChatLoading from "./ChatLoading";
import { ChatState } from "../context/ChatContext";
import { getSender } from "../utils/ChatLogics";
import toast from "react-hot-toast";
import "../App.css";

const MyChats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState();

  const { selectedChat, setSelectedChat, chats, setChats } = ChatState();

  const fetchChats = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      };

      const { data } = await axios.get(
        "http://localhost:8080/api/v1/chat/fetch-chats",
        config
      );
      setChats(data?.data);
      if (data?.data.length > 0) toast.success("Fetched Data");
      if (data?.data.length == 0)
        toast("No Chats Available", {
          icon: "😭",
        });
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("currentUser")));
    fetchChats();
  }, [fetchAgain]);

  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={3}
      bg="white"
      width={{ base: "100%", md: "31%" }}
      height="100%"
      borderRadius="lg"
      borderWidth="1px"
    >
      <Box
        pb={3}
        px={3}
        fontSize={{ base: "28px", md: "30px" }}
        fontFamily="Work sans"
        d="flex"
        width="100%"
        justifyContent="space-between"
        alignItems="center"
      >
        My Chats
      </Box>
      <Box
        display="flex"
        flexDir="column"
        p={3}
        bg="#F8F8F8"
        width="100%"
        height="100%"
        borderRadius="lg"
        overflowY="hidden"
      >
        {chats && chats.length > 0 ? (
          <Box height={"100%"} display={"flex"} flexDirection={"column"}>
            <Stack className="chatContainer" flex={1} overflowY="scroll">
              {chats.map((chat) => (
                <Box
                  onClick={() => setSelectedChat(chat)}
                  cursor="pointer"
                  mr={"10px"}
                  bg={
                    selectedChat && selectedChat._id === chat._id
                      ? "#38B2AC"
                      : "#E8E8E8"
                  }
                  color={
                    selectedChat && selectedChat._id === chat._id
                      ? "white"
                      : "black"
                  }
                  px={3}
                  py={2}
                  borderRadius="lg"
                  key={chat._id}
                >
                  <Text>
                    {!chat.isGroupChat
                      ? getSender(loggedUser, chat.users)
                      : chat.chatName}
                  </Text>
                </Box>
              ))}
            </Stack>
          </Box>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
};

export default MyChats;
