import Outpass from "../models/outpass.model.js";
import User from "../models/user.model.js";

/**
 * @desc    Get all outpasses with filtering and search
 * @route   GET /api/warden/all
 * @access  Private (Warden only)
 */
export const getAllOutpasses = async (req, res) => {
    try {
        const { status, curfew, search } = req.query;

        const filter = {};

        // Filter by status if provided and not 'ALL'
        if (status && status !== "ALL") {
            filter.status = status.toUpperCase();
        }

        // Filter by curfew extension (post-10:30 PM)
        if (curfew === "true") {
            filter.isCurfewExtension = true;
        }

        // Search by student name or roll number if search string provided
        if (search && search.trim() !== "") {
            const matchingStudents = await User.find({
                role: "student",
                $or: [
                    { name: { $regex: search.trim(), $options: "i" } },
                    { "studentProfile.rollNo": { $regex: search.trim(), $options: "i" } },
                ],
            }).select("_id");

            const studentIds = matchingStudents.map((s) => s._id);
            filter.student = { $in: studentIds };
        }

        const outpasses = await Outpass.find(filter)
            .populate("student", "name email phone studentProfile")
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
        console.error("Get All Outpasses Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch outpasses",
        });
    }
};

/**
 * @desc    Get pending review queue specifically
 * @route   GET /api/warden/pending
 * @access  Private (Warden only)
 */
export const getPendingQueue = async (req, res) => {
    try {
        const pendingOutpasses = await Outpass.find({ status: "PENDING" })
            .populate("student", "name email phone studentProfile")
            .sort({ isCurfewExtension: -1, createdAt: -1 }); // Curfew requests prioritized

        return res.status(200).json({
            success: true,
            count: pendingOutpasses.length,
            outpasses: pendingOutpasses,
        });
    } catch (error) {
        console.error("Get Pending Queue Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch pending queue",
        });
    }
};

/**
 * @desc    Approve or Reject an outpass
 * @route   PATCH /api/warden/:id/review
 * @access  Private (Warden only)
 */
export const reviewOutpass = async (req, res) => {
    try {
        const { id } = req.params;
        const { action, remarks } = req.body;
        const wardenId = req.user._id;

        if (!action || !["APPROVE", "REJECT"].includes(action.toUpperCase())) {
            return res.status(400).json({
                success: false,
                message: "Valid action is required: 'APPROVE' or 'REJECT'.",
            });
        }

        const outpass = await Outpass.findById(id).populate("student", "name email studentProfile");

        if (!outpass) {
            return res.status(404).json({
                success: false,
                message: "Outpass not found.",
            });
        }

        if (outpass.status !== "PENDING") {
            return res.status(400).json({
                success: false,
                message: `Cannot review an outpass with status '${outpass.status}'. Only 'PENDING' requests can be reviewed.`,
            });
        }

        if (action.toUpperCase() === "REJECT" && (!remarks || remarks.trim() === "")) {
            return res.status(400).json({
                success: false,
                message: "A remark is required when rejecting an outpass application.",
            });
        }

        if (action.toUpperCase() === "APPROVE") {
            // Generate unique Pass Code for gatekeeper lookup
            const generatedPassCode = await Outpass.generatePassCode();
            outpass.passCode = generatedPassCode;
            outpass.status = "APPROVED";
            outpass.wardenReview = {
                reviewedBy: wardenId,
                reviewedAt: new Date(),
                remarks: remarks ? remarks.trim() : "Approved by Warden.",
            };
        } else {
            outpass.status = "REJECTED";
            outpass.wardenReview = {
                reviewedBy: wardenId,
                reviewedAt: new Date(),
                remarks: remarks.trim(),
            };
        }

        await outpass.save();

        return res.status(200).json({
            success: true,
            message:
                action.toUpperCase() === "APPROVE"
                    ? `Outpass approved successfully! Pass Code: ${outpass.passCode}`
                    : "Outpass application rejected.",
            outpass,
        });
    } catch (error) {
        console.error("Review Outpass Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to review outpass",
        });
    }
};

/**
 * @desc    Get live metrics for Warden dashboard
 * @route   GET /api/warden/stats
 * @access  Private (Warden only)
 */
export const getWardenStats = async (req, res) => {
    try {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

        // Run parallel counts for fast response
        const [
            awaitingParentCount,
            pendingCount,
            curfewPendingCount,
            approvedCount,
            outsideCount,
            totalToday,
            currentlyOverdueOutpasses,
        ] = await Promise.all([
            Outpass.countDocuments({ status: "AWAITING_PARENT" }),
            Outpass.countDocuments({ status: "PENDING" }),
            Outpass.countDocuments({ status: "PENDING", isCurfewExtension: true }),
            Outpass.countDocuments({ status: "APPROVED" }),
            Outpass.countDocuments({ status: "EXITED" }),
            Outpass.countDocuments({ createdAt: { $gte: startOfToday } }),
            // Students who exited and their expected return time is in the past, but they haven't returned yet
            Outpass.find({
                status: "EXITED",
                expectedReturnTime: { $lt: now },
            })
                .populate("student", "name email phone studentProfile")
                .select("passCode destination expectedReturnTime gateLog student"),
        ]);

        return res.status(200).json({
            success: true,
            stats: {
                awaitingParentCount,
                pendingCount,
                curfewPendingCount,
                approvedCount,
                outsideCount,
                totalToday,
                overdueCount: currentlyOverdueOutpasses.length,
                currentlyOverdue: currentlyOverdueOutpasses,
            },
        });
    } catch (error) {
        console.error("Get Warden Stats Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch warden dashboard stats",
        });
    }
};
