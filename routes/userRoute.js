import { Router } from "express";
const router = Router();

import {
  login,
  forgotPassword,
  signUp,
  resetPassword,
  reset,
} from "../controllers/userController.js";
router.post("/user/signUp", signUp);
router.post("/user/login", login);
router.post("/user/forgotPassword", forgotPassword);
router.get("/user/reset/:token", reset);
router.post("/user/reset/:token", resetPassword);

export default router;
