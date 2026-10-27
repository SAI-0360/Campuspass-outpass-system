import Outpass, { checkIsCurfewExtension } from "../models/outpass.model.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";

/**
 * @desc    Apply for a new outpass
 * @route   POST /api/student/apply
 * @access  Private (Student only)
 */
export const applyOutpass = async (req, res) => {
    try {
        const studentId = req.user._id;
        const {
            outpassType,
            departureTime,
            expectedReturnTime,
            destination,
            reason,
            parentEmail,
            parentPhone,
        } = req.body;

        // 1. Basic validation
        if (
            !outpassType ||
            !departureTime ||
            !expectedReturnTime ||
            !destination ||
            !reason
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Please provide all required fields: outpassType, departureTime, expectedReturnTime, destination, and reason.",
            });
        }

        const depDate = new Date(departureTime);
        const retDate = new Date(expectedReturnTime);

        if (isNaN(depDate.getTime()) || isNaN(retDate.getTime())) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid date format for departure or expected return time.",
            });
        }

        // Departure cannot be in the past (allowing 10 min grace period for clock drift)
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        if (depDate < tenMinutesAgo) {
            return res.status(400).json({
                success: false,
                message: "Departure time cannot be in the past.",
            });
        }

        // Return time must be after departure time
        if (retDate <= depDate) {
            return res.status(400).json({
                success: false,
                message:
                    "Expected return time must be strictly after the departure time.",
            });
        }

        // 2. Anti-Duplicate Rule: Ensure student does not have an active outpass
        const existingActivePass = await Outpass.findOne({
            student: studentId,
            status: { $in: ["PENDING", "APPROVED", "EXITED"] },
        });

        if (existingActivePass) {
            return res.status(400).json({
                success: false,
                message: `You already have an active outpass (Status: ${existingActivePass.status}). You cannot apply for a new one until your current pass is completed or cancelled.`,
                activePassId: existingActivePass._id,
            });
        }

        // 3. 10:30 PM Curfew Rule check
        const isCurfew = checkIsCurfewExtension(depDate, retDate, outpassType);

        // Fallback to student profile's registered parent details if not explicitly typed in form
        const finalParentEmail =
            parentEmail || req.user.studentProfile?.parentEmail || "";
        const finalParentPhone =
            parentPhone || req.user.studentProfile?.parentPhone || "";

        if (isCurfew && !finalParentEmail && !finalParentPhone) {
            return res.status(400).json({
                success: false,
                message:
                    "Outpasses extending past the 10:30 PM curfew require parent contact details (email and phone).",
            });
        }

        // 4. File Upload (Cloudinary) for Proof Document
        let proofDocumentUrl = "";
        if (req.file) {
            try {
                const uploadResult = await uploadToCloudinary(
                    req.file.buffer,
                    "campuspass/proofs"
                );
                proofDocumentUrl = uploadResult.secure_url;
            } catch (uploadError) {
                return res.status(500).json({
                    success: false,
                    message:
                        "Failed to upload proof document. Please try again.",
                });
            }
        }

        // 5. Create Outpass record
        const newOutpass = await Outpass.create({
            student: studentId,
            outpassType,
            departureTime: depDate,
            expectedReturnTime: retDate,
            destination: destination.trim(),
            reason: reason.trim(),
            isCurfewExtension: isCurfew,
            parentEmail: finalParentEmail,
            parentPhone: finalParentPhone,
            proofDocument: proofDocumentUrl,
            status: "PENDING",
        });

        return res.status(201).json({
            success: true,
            message: isCurfew
                ? "Curfew extension outpass submitted. Pending Warden approval with parent verification."
                : "Outpass application submitted successfully. Pending Warden approval.",
            outpass: newOutpass,
        });
    } catch (error) {
        console.error("Apply Outpass Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to submit outpass application",
        });
    }
};

/**
 * @desc    Get all outpasses of the logged-in student
 * @route   GET /api/student/my-outpasses
 * @access  Private (Student only)
 */
export const getMyOutpasses = async (req, res) => {
    try {
        const studentId = req.user._id;
        const { status, type } = req.query;

        const query = { student: studentId };
        if (status) query.status = status.toUpperCase();
        if (type) query.outpassType = type;

        const outpasses = await Outpass.find(query)
            .populate("wardenReview.reviewedBy", "name email")
            .populate("gateLog.exitGuard", "name")
            .populate("gateLog.returnGuard", "name")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: outpasses.length,
            outpasses,
        });
    } catch (error) {
        console.error("Get My Outpasses Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch your outpasses",
        });
    }
};

/**
 * @desc    Get the student's current active outpass (for live digital badge/card)
 * @route   GET /api/student/active-pass
 * @access  Private (Student only)
 */
export const getActivePass = async (req, res) => {
    try {
        const studentId = req.user._id;

        // Active means PENDING, APPROVED, or EXITED
        const activePass = await Outpass.findOne({
            student: studentId,
            status: { $in: ["PENDING", "APPROVED", "EXITED"] },
        })
            .populate("wardenReview.reviewedBy", "name email")
            .populate("gateLog.exitGuard", "name")
            .populate("gateLog.returnGuard", "name");

        return res.status(200).json({
            success: true,
            hasActivePass: !!activePass,
            activePass: activePass || null,
        });
    } catch (error) {
        console.error("Get Active Pass Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch active pass",
        });
    }
};

/**
 * @desc    Cancel a pending outpass
 * @route   PATCH /api/student/:id/cancel
 * @access  Private (Student only)
 */
export const cancelOutpass = async (req, res) => {
    try {
        const studentId = req.user._id;
        const { id } = req.params;

        const outpass = await Outpass.findOne({ _id: id, student: studentId });

        if (!outpass) {
            return res.status(404).json({
                success: false,
                message: "Outpass not found or does not belong to you.",
            });
        }

        if (outpass.status !== "PENDING") {
            return res.status(400).json({
                success: false,
                message: `Cannot cancel an outpass with status '${outpass.status}'. Only 'PENDING' requests can be cancelled.`,
            });
        }

        outpass.status = "CANCELLED";
        await outpass.save();

        return res.status(200).json({
            success: true,
            message: "Outpass request cancelled successfully.",
            outpass,
        });
    } catch (error) {
        console.error("Cancel Outpass Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to cancel outpass",
        });
    }
};
