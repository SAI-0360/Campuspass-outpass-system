import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res
                .status(401)
                .json({
                    success: false,
                    message: "Authentication required. Please log in.",
                });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            return res
                .status(401)
                .json({
                    success: false,
                    message: "User session expired or user not found.",
                });
        }

        req.user = user;
        next();
    } catch (error) {
        return res
            .status(401)
            .json({
                success: false,
                message: "Invalid or expired token. Please log in again.",
            });
    }
};

export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Role '${req.user?.role || "guest"}' is not authorized to access this resource.`,
            });
        }
        next();
    };
};
