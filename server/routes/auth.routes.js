import express from "express";
import {
    register,
    login,
    logout,
    getMe,
    demoLogin,
    updateProfile,
    updatePassword,
} from "../controllers/auth.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/demo-login", demoLogin);
router.get("/me", isAuthenticated, getMe);
router.put("/profile", isAuthenticated, updateProfile);
router.patch("/profile", isAuthenticated, updateProfile);
router.put("/password", isAuthenticated, updatePassword);
router.patch("/password", isAuthenticated, updatePassword);

export default router;
