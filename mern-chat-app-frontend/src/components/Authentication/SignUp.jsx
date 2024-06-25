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
import { validationSchema } from "../../utils/SignupSchema";
import axios from "axios";
import toast from "react-hot-toast";

const SignUp = () => {
  const initialFormData = {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    userPic: null,
  };
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(initialFormData);

  const handlePic = (e) => {
    setFormData({ ...formData, userPic: e.target.files[0] });
  };

  const handleShow = () => setShow(!show);

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
      let response = await validationSchema.validate(formData, {
        abortEarly: false,
      });

      if (response) {
        return true;
      }
    } catch (error) {
      const newErrors = {};
      error.inner.forEach((err) => {
        newErrors[err?.path] = err?.message;
      });

      setErrors(newErrors);
    }
  };

  const handleSubmit = async () => {
    try {
      const isValid = await handleValidation();
      if (!isValid) return;

      const res = await axios.post(
        "http://localhost:8080/api/v1/user/register",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setIsLoading(false);
      setErrors({});

      toast.success("Registeration Successfull");

      setFormData(initialFormData);
    } catch (error) {
      console.log(error);
      toast.error(error?.message || "Error while signup");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <VStack spacing={2}>
      <FormControl isRequired isInvalid={errors.name}>
        <FormLabel>Name</FormLabel>
        <Input
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter Your Name"
        />
        {errors.name && <FormErrorMessage>{errors.name}</FormErrorMessage>}
      </FormControl>
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
            <Button h="1.75rem" size="sm" onClick={handleShow}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
        {errors.password && (
          <FormErrorMessage>{errors.password}</FormErrorMessage>
        )}
      </FormControl>
      <FormControl isRequired isInvalid={errors.confirmPassword}>
        <FormLabel>Confirm Password</FormLabel>
        <InputGroup>
          <Input
            name="confirmPassword"
            type={show ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm Password"
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleShow}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
        {errors.confirmPassword && (
          <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
        )}
      </FormControl>
      <FormControl isRequired isInvalid={errors.pic}>
        <FormLabel>Upload Your Picture</FormLabel>
        <Input
          name="userPic"
          type="file"
          accept="image/*"
          onChange={(e) => handlePic(e)}
          border={"none"}
        />
        {errors.userPic && <FormErrorMessage>{errors.userPic}</FormErrorMessage>}
      </FormControl>
      <Button
        colorScheme="blue"
        isLoading={isLoading}
        width="100%"
        onClick={handleSubmit}
      >
        Sign Up
      </Button>
    </VStack>
  );
};

export default SignUp;
