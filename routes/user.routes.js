// Importing express
const express = require("express");

const router = express.Router();
// import controller
const { isAuthenticated } = require("../utils/middleware/isAuthenticated");
const { userSignup, userLogin, userVerified, verifyUser, forgotPassword, resetPassword,  } = require("../controllers/user.controller");
// import validation
const { validateRequest, schemas } = require("../utils/validation/validation")

router.post("/signup", validateRequest(schemas.signupSchema), userSignup);
router.post("/login", validateRequest(schemas.loginSchema), userLogin);
router.post("/getotp", isAuthenticated, userVerified);
router.post("/verify-user", isAuthenticated, verifyUser);
router.post("/forget-password",  forgotPassword);
router.get("/reset-password/:token",  resetPassword);


module.exports = router;

