import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"],
        },
        role: {
            type: String,
            enum: {
                values: ["student", "warden", "guard"],
                message: "{VALUE} is not a valid role",
            },
            default: "student",
        },
        phone: {
            type: String,
            trim: true,
            default: "",
        },
        // Specific fields for students
        studentProfile: {
            rollNo: { type: String, trim: true, uppercase: true },
            hostelBlock: { type: String, trim: true },
            roomNo: { type: String, trim: true },
            department: { type: String, trim: true },
            parentName: { type: String, trim: true },
            parentPhone: { type: String, trim: true },
            parentEmail: { type: String, trim: true, lowercase: true },
        },
        // Specific fields for staff
        staffProfile: {
            hostelAssigned: { type: String, trim: true },
            gateNumber: { type: String, trim: true },
        },
    },
    {
        timestamps: true,
    }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Exclude password in JSON responses
userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    return user;
};

const User = mongoose.model("User", userSchema);
export default User;
