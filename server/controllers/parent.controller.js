import Outpass from "../models/outpass.model.js";

/**
 * @desc    Fetch outpass details for parent review via secure one-time token
 * @route   GET /api/parent/consent/:token
 * @access  Public (Token protected)
 */
export const getConsentDetails = async (req, res) => {
    try {
        const { token } = req.params;

        if (!token || token.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Verification token is required.",
            });
        }

        const outpass = await Outpass.findOne({
            "parentConsent.token": token.trim(),
        }).populate("student", "name email phone studentProfile");

        if (!outpass) {
            return res.status(404).json({
                success: false,
                message: "Invalid or expired parent verification link.",
            });
        }

        return res.status(200).json({
            success: true,
            outpass: {
                _id: outpass._id,
                student: {
                    name: outpass.student?.name,
                    rollNo: outpass.student?.studentProfile?.rollNo,
                    hostelBlock: outpass.student?.studentProfile?.hostelBlock,
                    roomNo: outpass.student?.studentProfile?.roomNo,
                    department: outpass.student?.studentProfile?.department,
                    phone: outpass.student?.phone,
                },
                outpassType: outpass.outpassType,
                destination: outpass.destination,
                reason: outpass.reason,
                departureTime: outpass.departureTime,
                expectedReturnTime: outpass.expectedReturnTime,
                isCurfewExtension: outpass.isCurfewExtension,
                proofDocument: outpass.proofDocument,
                parentConsent: outpass.parentConsent,
                status: outpass.status,
                createdAt: outpass.createdAt,
            },
        });
    } catch (error) {
        console.error("Get Parent Consent Details Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to load leave verification details.",
        });
    }
};

/**
 * @desc    Submit parent decision (Authorize or Deny leave)
 * @route   POST /api/parent/consent/:token/respond
 * @access  Public (Token protected)
 */
export const submitConsent = async (req, res) => {
    try {
        const { token } = req.params;
        const { decision, remarks } = req.body;

        if (!token || token.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Verification token is required.",
            });
        }

        if (!decision || !["APPROVE", "DENY"].includes(decision.toUpperCase())) {
            return res.status(400).json({
                success: false,
                message: "Decision must be either 'APPROVE' or 'DENY'.",
            });
        }

        const outpass = await Outpass.findOne({
            "parentConsent.token": token.trim(),
        }).populate("student", "name email phone studentProfile");

        if (!outpass) {
            return res.status(404).json({
                success: false,
                message: "Invalid or expired verification link.",
            });
        }

        // Single-use check: Prevent double-decision
        if (outpass.parentConsent?.status !== "PENDING") {
            return res.status(400).json({
                success: false,
                message: `Consent has already been recorded on ${new Date(
                    outpass.parentConsent.verifiedAt
                ).toLocaleString("en-IN")}. Current status: ${outpass.parentConsent.status}.`,
            });
        }

        const isApproved = decision.toUpperCase() === "APPROVE";

        if (isApproved) {
            // Parent authorizes -> Moves to Stage 2 (Warden Review Queue)
            outpass.parentConsent.status = "APPROVED";
            outpass.parentConsent.verifiedAt = new Date();
            outpass.parentConsent.parentRemarks =
                remarks?.trim() || "Parent granted permission.";
            outpass.status = "PENDING";
        } else {
            // Parent denies -> Direct Rejection (never reaches Warden)
            outpass.parentConsent.status = "DENIED";
            outpass.parentConsent.verifiedAt = new Date();
            outpass.parentConsent.parentRemarks =
                remarks?.trim() || "Permission denied by parent.";
            outpass.status = "REJECTED";
        }

        await outpass.save();

        const message = isApproved
            ? `Permission granted successfully for ${outpass.student?.name}. The application has been forwarded to the Hostel Warden for final clearance.`
            : `Leave permission denied for ${outpass.student?.name}. This outpass has been marked as rejected.`;

        return res.status(200).json({
            success: true,
            message,
            decision: outpass.parentConsent.status,
            outpass,
        });
    } catch (error) {
        console.error("Submit Parent Consent Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to record parent consent decision.",
        });
    }
};
