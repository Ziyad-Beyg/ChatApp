import { Box } from "@chakra-ui/react";
import { isUserOnline } from "../../utils/ChatLogics";
import { ChatState } from "../../context/ChatContext";

const UserStatus = () => {
  const { user, selectedChat, onlineUsers } = ChatState();
  const status = isUserOnline(user, selectedChat?.users, onlineUsers);
  return (
    <Box
      position={"absolute"}
      fontSize={10}
      fontWeight={"600"}
      color={status === "online" ? "green" : "gray"}
      bottom={"-1"}
      right={"-6"}
    >
      <span>{status}</span>
    </Box>
  );
};

export default UserStatus;
