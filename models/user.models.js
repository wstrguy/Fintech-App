//  creating user schema 
// Importing mongoose 
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    firstname: {
        type: String
    },
    lastname: {
        type: String
    },
    email: {
        type: String
    },
    password: {
        type: String
    },
    passwordResetToken: {
        type: String,
    },
    passwordResetExpires: {
        type: Date,
    },
    
    confirmPassword: {
        type: String
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    
}, {
    timestamps: true
});

module.exports = mongoose.model("User", userSchema)