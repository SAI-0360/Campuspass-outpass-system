import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import studentRoutes from "./routes/student.routes.js";
import wardenRoutes from "./routes/warden.routes.js";
import guardRoutes from "./routes/guard.routes.js";
import parentRoutes from "./routes/parent.routes.js";
import { notFound, errorHandler } from "./middlewares/error.middleware.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 7000;

// Connect to MongoDB
connectDB();

// Global Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:5175",
        credentials: true,
    })
);

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        message: "CampusPass API server is running smoothly",
        timestamp: new Date().toISOString(),
    });
});

// Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/warden", wardenRoutes);
app.use("/api/guard", guardRoutes);
app.use("/api/parent", parentRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`[CampusPass Server] running on http://localhost:${PORT}`);
});
