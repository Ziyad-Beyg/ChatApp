import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { validationSchema } from "../../utils/loginSchema";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { ChatState } from "../../context/ChatContext";

const Login = () => {
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  let navigate = useNavigate();
  let { setUser } = ChatState();

  const handleClick = () => setShow(!show);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleValidation = async () => {
    try {
      setIsLoading(true);
      const response = await validationSchema.validate(formData, {
        abortEarly: false,
      });

      setErrors({});

      if (response) {
        return true;
      }
    } catch (error) {
      console.log(error);
      const newErrors = {};
      error.inner.forEach((err) => {
        newErrors[err.path] = err.message;
      });
      setErrors(newErrors);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const isValid = await handleValidation();
      if (!isValid) return;

      const { data, status } = await axios.post(
        "http://localhost:8080/api/v1/user/login",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setIsLoading(false);

      if (status == 200) {
        setUser(data?.data?.user);
        localStorage.setItem("accessToken", data?.data?.accessToken);
        localStorage.setItem("currentUser", JSON.stringify(data?.data?.user));
        navigate("/chats", { replace: true });
        toast.success("Login Successfull");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const handleGuestLogin = () => {
    setFormData({
      email: "guest@gmail.com",
      password: "123456",
    });
  };
  return (
    <VStack mt={5} spacing={2}>
      <FormControl isRequired isInvalid={errors.email}>
        <FormLabel>Email Address</FormLabel>
        <Input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter Your Email Address"
        />
        {errors.email && <FormErrorMessage>{errors.email}</FormErrorMessage>}
      </FormControl>
      <FormControl isRequired isInvalid={errors.password}>
        <FormLabel>Password</FormLabel>
        <InputGroup>
          <Input
            name="password"
            type={show ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter Password"
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleClick}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
        {errors.password && (
          <FormErrorMessage>{errors.password}</FormErrorMessage>
        )}
      </FormControl>
      <Button
        mt={2}
        isLoading={isLoading}
        colorScheme="blue"
        width="100%"
        onClick={handleSubmit}
      >
        Login
      </Button>
      <Button colorScheme="red" width="100%" onClick={handleGuestLogin}>
        Get Guest User Credentials
      </Button>
    </VStack>
  );
};

export default Login;
