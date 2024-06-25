import {
  Box,
  Container,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from "@chakra-ui/react";
import Login from "../components/Authentication/Login";
import SignUp from "../components/Authentication/SignUp";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("currentUser"));
    const accessToken = localStorage.getItem("accessToken");
    if (userData && accessToken) navigate("/chats", { replace: true });
  }, [navigate]);

  return (
    <Container maxW={"2xl"}>
      <Box bg={"white"} mt={5} borderRadius={"20px"} p={4}>
        <Text align={"center"} fontFamily={"work sans"} fontSize={24}>
          CHAT APP
        </Text>
      </Box>
      <Box bg={"white"} mt={5} borderRadius={"20px"} p={5}>
        <Tabs variant="soft-rounded">
          <TabList>
            <Tab width={"50%"}>Login</Tab>
            <Tab width={"50%"}>Sign Up</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Login />
            </TabPanel>
            <TabPanel>
              <SignUp />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  );
};

export default Home;
