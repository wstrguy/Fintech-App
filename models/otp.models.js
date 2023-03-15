const mongoose = require("mongoose");

// Otp Schema
const otpSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    email: {
        type: String,
    },
    otpToken: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300, // 5 minutes
    },
}, { timestamps: true });

module.exports = mongoose.model("OTP", otpSchema);
