import AsyncHandler from "../utils/AsyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/users.model.js";
import uploadOnCloudinary from "../utils/Cloudinary.js";

const generateAccessToken = async (userID) => {
  try {
    const user = await User.findById(userID);
    const accessToken = user.generateAccessToken();

    return accessToken;
  } catch (error) {
    console.log(error);
    throw new ApiError(
      500,
      "Something went wrong while generating access token"
    );
  }
};

// REGISTER USER
const registerUser = AsyncHandler(async (req, res) => {
  const { name, email, password, isAdmin } = req.body;

  if ([name, email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required!");
  }

  const existedUser = await User.findOne({ email });

  if (existedUser) {
    throw new ApiError(409, "User with email already exist");
  }

  let userPicLocalPath;
  if (
    req.files &&
    Array.isArray(req.files?.userPic) &&
    req.files.userPic.length > 0
  ) {
    userPicLocalPath = req.files.userPic[0].path;
  }

  const userPic = await uploadOnCloudinary(userPicLocalPath);

  const user = await User.create({
    name: name.toLowerCase(),
    email,
    password,
    userPic: userPic?.url,
    isAdmin,
  });

  const createdUser = await User.findById(user._id).select("-password");

  if (!createdUser) {
    throw new ApiError(500, "User creation failed");
  }

  console.log("Signup Successfully");

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully!"));
});

// LOGIN USER
const loginUser = AsyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if ([email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const accessToken = await generateAccessToken(user._id);

  const loggedInUser = await User.findById(user._id).select("-password");

  console.log("Login Successfully");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken },
        "User logged In Successfully"
      )
    );
});

// SEARCH USERS THROUGH QUERY
const searchAllUsersWithQueryParamater = AsyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const allUsers = await User.find(keyword).find({
    _id: { $ne: req.user._id },
  });

  if (allUsers.length === 0) {
    throw new ApiError(404, "No user found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        allUsers,
        `All users that matched ${req.query.search}`
      )
    );
});

export { registerUser, loginUser, searchAllUsersWithQueryParamater };
