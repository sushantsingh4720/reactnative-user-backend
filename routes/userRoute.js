import { Router } from "express";
const router = Router();
import authMiddleware from "../middlerware/authMiddleware.js";
import {
  login,
  forgotPassword,
  signUp,
  resetPassword,
  reset,
  profileView,
  updateProfile,
} from "../controllers/userController.js";
router.post("/user/signUp", signUp);
router.post("/user/login", login);
router.post("/user/forgotPassword", forgotPassword);
router.get("/user/reset/:token", reset);
router.post("/user/reset/:token", resetPassword);
router.get("/user/profile", authMiddleware, profileView);
router.put("/user/profile/updateprofile", authMiddleware, updateProfile);
export default router;
