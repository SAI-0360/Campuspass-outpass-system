import User from "../models/user.model.js";
import { generateToken, cookieOptions } from "../utils/generateToken.js";

// Register new user
export const register = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            role,
            phone,
            studentProfile,
            staffProfile,
        } = req.body;

        if (!name || !email || !password) {
            return res
                .status(400)
                .json({
                    success: false,
                    message: "Name, email, and password are required.",
                });
        }

        const existingUser = await User.findOne({
            email: email.toLowerCase().trim(),
        });
        if (existingUser) {
            return res
                .status(400)
                .json({
                    success: false,
                    message: "An account with this email already exists.",
                });
        }

        // Role-specific validation
        const userRole =
            role && ["student", "warden", "guard"].includes(role)
                ? role
                : "student";

        const userData = {
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password,
            role: userRole,
            phone: phone || "",
        };

        if (userRole === "student" && studentProfile) {
            userData.studentProfile = {
                rollNo: studentProfile.rollNo || "",
                hostelBlock: studentProfile.hostelBlock || "",
                roomNo: studentProfile.roomNo || "",
                department: studentProfile.department || "",
                parentName: studentProfile.parentName || "",
                parentPhone: studentProfile.parentPhone || "",
                parentEmail: studentProfile.parentEmail || "",
            };
        } else if (staffProfile) {
            userData.staffProfile = {
                hostelAssigned: staffProfile.hostelAssigned || "",
                gateNumber: staffProfile.gateNumber || "",
            };
        }

        const newUser = await User.create(userData);
        const token = generateToken(newUser._id);
        res.cookie("token", token, cookieOptions);

        return res.status(201).json({
            success: true,
            message: "Registration successful",
            user: newUser,
        });
    } catch (error) {
        console.error("Register Error:", error);
        return res
            .status(500)
            .json({
                success: false,
                message: error.message || "Registration failed",
            });
    }
};

// Login user
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res
                .status(400)
                .json({
                    success: false,
                    message: "Please provide both email and password.",
                });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res
                .status(401)
                .json({
                    success: false,
                    message: "Invalid email or password.",
                });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res
                .status(401)
                .json({
                    success: false,
                    message: "Invalid email or password.",
                });
        }

        const token = generateToken(user._id);
        res.cookie("token", token, cookieOptions);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            user,
        });
    } catch (error) {
        console.error("Login Error:", error);
        return res
            .status(500)
            .json({ success: false, message: error.message || "Login failed" });
    }
};

// Logout user
export const logout = (req, res) => {
    res.clearCookie("token", { ...cookieOptions, maxAge: 0 });
    return res
        .status(200)
        .json({ success: true, message: "Logged out successfully." });
};

// Get current logged-in user profile
export const getMe = async (req, res) => {
    return res.status(200).json({
        success: true,
        user: req.user,
    });
};

// Demo quick-login for evaluation & testing
export const demoLogin = async (req, res) => {
    try {
        const { role } = req.body;
        if (!role || !["student", "warden", "guard"].includes(role)) {
            return res
                .status(400)
                .json({
                    success: false,
                    message:
                        "Valid demo role is required (student, warden, guard).",
                });
        }

        const demoEmail = `demo.${role}@campuspass.edu`;
        let user = await User.findOne({ email: demoEmail });

        // Auto-seed demo user if not present
        if (!user) {
            const demoUsers = {
                student: {
                    name: "Rahul Verma",
                    email: demoEmail,
                    password: "password123",
                    role: "student",
                    phone: "9876543210",
                    studentProfile: {
                        rollNo: "22CSE104",
                        hostelBlock: "BH-2 (Boys Hostel 2)",
                        roomNo: "304",
                        department: "Computer Science",
                        parentName: "Sanjay Verma",
                        parentPhone: "9811223344",
                        parentEmail: "parent.verma@example.com",
                    },
                },
                warden: {
                    name: "Dr. A. K. Sharma",
                    email: demoEmail,
                    password: "password123",
                    role: "warden",
                    phone: "9876500001",
                    staffProfile: {
                        hostelAssigned: "BH-2 & GH-1",
                    },
                },
                guard: {
                    name: "Officer Vikram Singh",
                    email: demoEmail,
                    password: "password123",
                    role: "guard",
                    phone: "9876500002",
                    staffProfile: {
                        gateNumber: "Gate 1 (Main Campus Gate)",
                    },
                },
            };

            user = await User.create(demoUsers[role]);
        }

        const token = generateToken(user._id);
        res.cookie("token", token, cookieOptions);

        return res.status(200).json({
            success: true,
            message: `Logged in as demo ${role}`,
            user,
        });
    } catch (error) {
        console.error("Demo Login Error:", error);
        return res
            .status(500)
            .json({
                success: false,
                message: error.message || "Demo login failed",
            });
    }
};
