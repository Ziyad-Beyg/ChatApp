import { User } from "../models/users.model.js";
import ApiError from "../utils/ApiError.js";
import AsyncHandler from "../utils/AsyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = AsyncHandler(async (req, _, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      throw new ApiError(401, "No token found");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    if (!decodedToken) {
      throw new ApiError(401, "Invalid Token");
    }

    const user = await User.findById(decodedToken._id).select("-password");

    if (!user) {
      throw new ApiError(401, "Unauthorized request");
    }

    req.user = user;

    next();
  } catch (error) {
    console.log(error);
    throw new ApiError(401, error?.message || "Invalid Access Token");
  }
});
