import { Router } from "express";
import {
  registerUser,
  loginUser,
  searchAllUsersWithQueryParamater,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router
  .route("/register")
  .post(upload.fields([{ name: "userPic", maxCount: 1 }]), registerUser);

router.route("/login").post(loginUser);

// Protected Routes
router.route("/").get(verifyJWT, searchAllUsersWithQueryParamater);

export default router;
