import { ChatState } from "../context/ChatContext";
import { CheckIcon, DeleteIcon } from "@chakra-ui/icons";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Box } from "@chakra-ui/react";
import "../App.css";

const ScrollableChat = ({ messages, socket }) => {
  const { user } = ChatState();
  const [allMessages, setAllMessages] = useState([]);
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const scrollRef = useRef(null);
  useEffect(() => {
    setAllMessages(messages);
  }, [messages]);

  useEffect(() => {
    socket.on("deletionId", (id) => {
      setAllMessages((prevMessages) => {
        const updatedMessages = prevMessages.filter((mess) => mess._id !== id);
        return updatedMessages;
      });
      toast.success("Message Deleted");
    });
  }, []);

  const handleDelete = async (messageId) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        const config = {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        };

        const { data } = await axios.delete(
          `http://localhost:8080/api/v1/message/delete-message/${messageId}`,
          config
        );

        if (data?.data) {
          socket.emit("messageDeleted", messageId);
        }
        toast.success("Message Deleted");

        setAllMessages((prevMessages) => {
          const updatedMessages = prevMessages.filter(
            (mess) => mess._id !== messageId
          );
          return updatedMessages;
        });
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
      throw new Error(error);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [allMessages]);
  return (
    <Box
      mt={"4rem"}
      mb={"1rem"}
      flex={1}
      overflowY={"auto"}
      className="scrollable-chat"
      ref={scrollRef}
    >
      {allMessages &&
        allMessages.map((m) => (
          <div
            style={{
              display: "flex",
              justifyContent: m.sender._id === user._id ? "end" : "start",
            }}
            key={m._id}
            onMouseEnter={() => setHoveredMessageId(m._id)}
            onMouseLeave={() => setHoveredMessageId(null)}
          >
            <span
              style={{
                backgroundColor: `${
                  m.sender._id === user._id ? "#BEE3F8" : "#B9F5D0"
                }`,
                marginTop: "2px",
                borderRadius: "20px",
                padding: "5px 25px 5px 15px",
                marginRight: m.sender._id === user._id ? "5px" : "0",
                maxWidth: "75%",
                position: "relative",
              }}
            >
              {m.sender._id === user._id && hoveredMessageId === m._id && (
                <DeleteIcon
                  onClick={() => handleDelete(m._id)}
                  fontSize={14}
                  position={"absolute"}
                  left={-5}
                  top={2.5}
                  style={{ cursor: "pointer" }}
                />
              )}
              {m.content}
              {m.sender._id === user._id && m?.messageStatus === "read" ? (
                <>
                  <CheckIcon
                    mx={2}
                    fontSize={8}
                    position={"absolute"}
                    bottom={2}
                    color={"darkGreen"}
                  />
                  <CheckIcon
                    mx={2}
                    fontSize={8}
                    position={"absolute"}
                    bottom={2}
                    right={1}
                    color={"darkGreen"}
                  />
                </>
              ) : m.sender._id === user._id &&
                m?.messageStatus === "delivered" ? (
                <>
                  <CheckIcon
                    mx={2}
                    fontSize={8}
                    position={"absolute"}
                    bottom={2}
                    color={"grey"}
                  />
                  <CheckIcon
                    mx={2}
                    fontSize={8}
                    position={"absolute"}
                    bottom={2}
                    right={1}
                    color={"grey"}
                  />
                </>
              ) : (
                m.sender._id === user._id &&
                m?.messageStatus === "sent" && (
                  <CheckIcon
                    mx={2}
                    fontSize={8}
                    position={"absolute"}
                    bottom={2}
                    color={"grey"}
                  />
                )
              )}
            </span>
          </div>
        ))}
    </Box>
  );
};

export default ScrollableChat;
