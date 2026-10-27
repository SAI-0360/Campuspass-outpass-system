import express from "express";
import {
    getAllOutpasses,
    getPendingQueue,
    reviewOutpass,
    getWardenStats,
} from "../controllers/warden.controller.js";
import {
    isAuthenticated,
    authorizeRoles,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

// All warden routes require authentication and 'warden' role
router.use(isAuthenticated, authorizeRoles("warden"));

router.get("/all", getAllOutpasses);
router.get("/pending", getPendingQueue);
router.get("/stats", getWardenStats);
router.patch("/:id/review", reviewOutpass);

export default router;
