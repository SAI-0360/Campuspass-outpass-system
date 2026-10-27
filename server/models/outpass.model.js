import mongoose from "mongoose";

/**
 * Calculates whether an outpass exceeds the 10:30 PM hostel curfew
 * or spans overnight/across multiple calendar days.
 */
export const checkIsCurfewExtension = (
    departureTime,
    expectedReturnTime,
    outpassType
) => {
    if (outpassType === "night_out" || outpassType === "weekend_home") {
        return true;
    }

    if (!expectedReturnTime || !departureTime) {
        return false;
    }

    const dep = new Date(departureTime);
    const ret = new Date(expectedReturnTime);

    // Spans across different calendar days
    const isDifferentDay =
        ret.getFullYear() !== dep.getFullYear() ||
        ret.getMonth() !== dep.getMonth() ||
        ret.getDate() !== dep.getDate();

    if (isDifferentDay) return true;

    // Same day: check if return time is past 10:30 PM (22:30)
    const returnHour = ret.getHours();
    const returnMinutes = ret.getMinutes();

    if (returnHour > 22 || (returnHour === 22 && returnMinutes > 30)) {
        return true;
    }

    return false;
};

const outpassSchema = new mongoose.Schema(
    {
        passCode: {
            type: String,
            unique: true,
            sparse: true,
            trim: true,
        },
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Student reference is required"],
        },
        outpassType: {
            type: String,
            enum: {
                values: ["day_out", "night_out", "weekend_home", "emergency"],
                message: "{VALUE} is not a valid outpass type",
            },
            required: [true, "Outpass type is required"],
        },
        departureTime: {
            type: Date,
            required: [true, "Departure date and time is required"],
        },
        expectedReturnTime: {
            type: Date,
            required: [true, "Expected return date and time is required"],
        },
        destination: {
            type: String,
            required: [true, "Destination is required"],
            trim: true,
        },
        reason: {
            type: String,
            required: [true, "Reason for outpass is required"],
            trim: true,
        },

        // 10:30 PM Curfew Rule Logic
        isCurfewExtension: {
            type: Boolean,
            default: false,
        },
        parentEmail: {
            type: String,
            trim: true,
            lowercase: true,
            default: "",
        },
        parentPhone: {
            type: String,
            trim: true,
            default: "",
        },
        proofDocument: {
            type: String, // Cloudinary secure URL (ticket / email screenshot / parent consent)
            default: "",
        },

        // Lifecycle Status
        status: {
            type: String,
            enum: {
                values: [
                    "PENDING",
                    "APPROVED",
                    "REJECTED",
                    "EXITED",
                    "RETURNED",
                    "CANCELLED",
                ],
                message: "{VALUE} is not a valid status",
            },
            default: "PENDING",
            index: true,
        },

        // Warden Review Details
        wardenReview: {
            reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            reviewedAt: { type: Date },
            remarks: { type: String, trim: true, default: "" },
        },

        // Security Gate Verification Logs
        gateLog: {
            actualExitTime: { type: Date },
            exitGuard: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            exitPhoto: { type: String, default: "" }, // Cloudinary image URL at exit

            actualReturnTime: { type: Date },
            returnGuard: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            returnPhoto: { type: String, default: "" }, // Cloudinary image URL at return

            wasLate: { type: Boolean, default: false },
            lateMinutes: { type: Number, default: 0 },
        },
    },
    {
        timestamps: true,
    }
);

// Pre-save hook to ensure isCurfewExtension is set
outpassSchema.pre("save", function (next) {
    this.isCurfewExtension = checkIsCurfewExtension(
        this.departureTime,
        this.expectedReturnTime,
        this.outpassType
    );
    next();
});

// Helper static method to generate a unique readable Pass Code (e.g. CP-4821)
outpassSchema.statics.generatePassCode = async function () {
    let uniqueCode = "";
    let exists = true;

    while (exists) {
        const randomDigits = Math.floor(1000 + Math.random() * 9000); // 4-digit number
        uniqueCode = `CP-${randomDigits}`;
        const found = await this.findOne({ passCode: uniqueCode });
        if (!found) {
            exists = false;
        }
    }

    return uniqueCode;
};

const Outpass = mongoose.model("Outpass", outpassSchema);
export default Outpass;
