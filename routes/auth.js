const express = require("express");
const router = express.Router();
const AuthController = require("../app/controllers/AuthController.js");
const profileImgUploader = require("../app/controllers/fileUploader/ProfileImg").profileImgUploader;

// router.get('/login', AuthController.loginPage);
router.post("/login", AuthController.login);
router.post("/logout", AuthController.logout);
router.get("/verify", AuthController.accountVerify);

// router.get('/sign-up', AuthController.signUpPage);
router.post("/sign-up", AuthController.signUp);
router.post("/invitee", AuthController.invitedUserSignUp);
router.get("/get_invite/:id", AuthController.getInvite);

// router.get('/forgot-password', AuthController.forgotPasswordPage);
router.post("/forget-password", AuthController.forgotPassword);
router.post("/reset-password", AuthController.resetPassword);
router.post("/updatepassword", AuthController.updatePassword);
router.put("/update_profile", profileImgUploader, AuthController.updateProfile);
router.post("/upload", AuthController.scannedImage);
router.post("/scannedcard", AuthController.addScannedCard);
router.get("/get_userDetails/:id", AuthController.getUserDetails);

module.exports = router;
