import express from "express";
import {
    applyOutpass,
    applyDemoOutpass,
    getMyOutpasses,
    getActivePass,
    cancelOutpass,
} from "../controllers/student.controller.js";
import {
    isAuthenticated,
    authorizeRoles,
} from "../middlewares/auth.middleware.js";
import uploadSingle from "../middlewares/upload.middleware.js";

const router = express.Router();

// All student routes require authentication and 'student' role
router.use(isAuthenticated, authorizeRoles("student"));

router.post("/apply", uploadSingle.single("proofDocument"), applyOutpass);
router.post("/demo-apply", applyDemoOutpass);
router.get("/my-outpasses", getMyOutpasses);
router.get("/active-pass", getActivePass);
router.patch("/:id/cancel", cancelOutpass);

export default router;
