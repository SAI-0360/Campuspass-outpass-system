import express from "express";
import {
    lookupPass,
    getGateFeeds,
    confirmExit,
    confirmReturn,
} from "../controllers/guard.controller.js";
import {
    isAuthenticated,
    authorizeRoles,
} from "../middlewares/auth.middleware.js";
import uploadSingle from "../middlewares/upload.middleware.js";

const router = express.Router();

// All guard routes require authentication and 'guard' role
router.use(isAuthenticated, authorizeRoles("guard"));

router.get("/lookup/:query", lookupPass);
router.get("/feeds", getGateFeeds);
router.patch("/:id/exit", uploadSingle.single("photo"), confirmExit);
router.patch("/:id/return", uploadSingle.single("photo"), confirmReturn);

export default router;
