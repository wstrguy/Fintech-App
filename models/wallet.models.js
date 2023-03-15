const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    balance: {
        type: Number,
        default: 0,
    },
    walletId: {
        type: String,

    },
    balanceAfter: {
        type: Number,
        default: 0
    },
    balanceBefore: {
        type: Number,
        default: 0
    }
}, { timestamps: true }

);

module.exports = mongoose.model("Wallet", walletSchema);
