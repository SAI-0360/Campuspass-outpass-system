import express from "express";
import {
    getConsentDetails,
    submitConsent,
} from "../controllers/parent.controller.js";

const router = express.Router();

// Public parent verification routes (token-protected)
router.get("/consent/:token", getConsentDetails);
router.post("/consent/:token/respond", submitConsent);

export default router;
