// Importing Section
const User = require("../models/user.models");
const OTP = require("../models/otp.models");
const bcrypt = require("bcrypt");
const Wallet = require("../models/wallet.models");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const speakeasy = require('speakeasy');
const createJWT = require("../utils/jwt");
const sendEmail = require("../utils/middleware/sendEmail");
const { isAuthenticated } = require("../utils/middleware/isAuthenticated");

exports.userSignup = async (req, res) => {
    const { firstname, lastname, email, password, confirmPassword } = req.body;
    try {
        // check is User already exist
        const userAlreadyExist = await User.findOne({ email });
        if (userAlreadyExist) {
            return res.status(400).json({
                message: "User already exist",
            });
        }
    

        // hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const hashedconfirmPassword = await bcrypt.hash(confirmPassword, salt);

        const user = await User.create({
            firstname,
            lastname,
            email,
            password: hashedPassword,
            confirmPassword: hashedconfirmPassword,
        });

        
        // create wallet id - uuid
        const uuid = uuidv4();
        const walletId = uuid.replace(/-/g, "").substring(0, 10);

        console.log(walletId);

        // create wallet
        const newWallet = await Wallet.create({
            walletId: walletId,
            userId: user._id,
        });

        // send email
        await sendEmail({
            email: email,
            subject: "Welcome to the FinTech app",
            html: `<h1> Welcome to the family </h1>
            <p> Thank you for signing up with us, this is your wallet ID - <b>${walletId}</b> </p>`

        });

        return res.status(201).json({
            message: "User created successfully",
            user,
            newWallet,
            
        });
    } catch (error) {
        return res.status(500).json({
            message: "something went wrong",
            error: error.message,
        });
    }
}


// Creating User login 

exports.userLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        // input validation for existing user
        const userExistinDb = await User.findOne({ email });
        if (!userExistinDb) {
            return res.status(400).json({
                message: "Email does not exist",
            });
        }

        // match password
        const passMatch = await bcrypt.compare(password, userExistinDb.password);
        if (!passMatch) {
            return res.status(400).json({
                message: "Invalid Password",
            });
        }

        // Creating Jwt token
        const accessToken = await createJWT({
            id: userExistinDb._id,
            email: userExistinDb.email,
            firstname: userExistinDb.firstname,
        });
        // set cookie
        res.cookie("accessToken", accessToken);


        return res.status(200).json({
            message: "User logged in successfully",
            accessToken,
        });

    } catch (error) {
        return res.status(500).json({
            message: "Something went wrong",
            error: error.message,
        });
    }
};


// User verification

exports.userVerified = async (req, res) => {
    const { otpToken } = req.body;
    const { id } = req.user;

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }
        const token = await speakeasy.totp({
            secret: process.env.OTP_SECRET,
            encoding: 'base32',
            expiry: 60  * 5 // 5 minutes
          });
          console.log(token);
        const otp = await OTP.create({
            userId: user._id,
            otpToken: token,
            email: user.email,
        });

        

        await sendEmail({
            email: user.email,
            subject: "OTP for verification",
            html: `<h1> Welcome to the family </h1>
            <p> Verify your account using this OTP - <b>${token}</b> </p>
            <p> This OTP will expire in 5 minutes </p>`
        });
        return res.status(200).json({
            message: "OTP sent to your email",
            otp,
        });
        

    }catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Something went wrong while verifying user",
            error: error.message,
        });
    }
}


exports.verifyUser = async (req, res) => {
    const { id } = req.user;
    const { email, otpToken } = req.body;
    
    try {
        // input validation for existing user
        const id = req.user.id;
        const user = await User.findById(id);
        if (!user) {
            return res.status(400).json({
                message: "User does not exist",
            });
        }

        // match otp
        const checkOtp = await OTP.findOne({otpToken});
        if (!checkOtp) {
            return res.status(400).json({
                message: "Invalid OTP",
            });
        } 
        user.isVerified = true;
        await user.save();


        return res.status(200).json({
            message: "User verified successfully",
            user,
        });

    } catch (error) {
        return res.status(500).json({
            message: "Something went wrong while verifying user",
            error: error.message,
        });
    }
};


// forgot password

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {

        const user = await User.findOne({email});

        if(!user)
        return res.status(404).json({
            error: "User not found"
        });

        // generate password token
        const passwordToken = await jwt.sign({
            id: user._id

        },"secret", {
            expiresIn:"2d"
        })

        const resetUrl = `http://localhost:2256/api/reset-password/${passwordToken}`;

        await sendEmail({
            email: user.email,
            subject: "Reset your password",
            html: `<h1> Reset your password </h1>
            <p> Click on the link below to reset your password </p>
            <a href=${resetUrl}> Reset Password </a>`
        });

        user.passwordResetToken = passwordToken;
        user.passwordResetExpires = Date.now() + 2 * 24 * 60 * 60 * 1000;
        await user.save();
        return res.status(200).json({
            message: "Password reset link sent to your email",
            user,
        });

    } catch (error) {
        return res.status(500).json({
            message: "Something went wrong trying to reset password",
            error: error.message,
        });
    }
};

// reset password
exports.resetPassword = async (req, res) => {
    const { password } = req.body;
    const { token } = req.params;
    try {

        // verify token
        const verify_token = await jwt.verify(token, "secret");
        if(!verify_token)
        return res.status(400).json({
            error: "Invalid token"
        });
        
      // find user by token
      const user = await User.findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: Date.now() },
        });

        if(!user)
        return res.status(404).json({
            error: "User not found"
        });

        // hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user.password = hashedPassword;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        return res.status(200).json({
            message: "Password reset successfully",
            user,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Something went wrong trying to reset password",
            error: error.message,
        });
    }
}