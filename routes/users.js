const catchAsync = require("../utils/catchAsync");
const express = require("express");
const passport = require("passport");
const router = express.Router();
const users = require("../controllers/users");

router.route("/register")
    .get(users.getRegister)
    .post(catchAsync(users.registerUser));

router.route("/login")
    .get(users.getLogin)
    .post(passport.authenticate("local", { failureFlash: true, failureRedirect: "/login" }), users.loginUser);

router.get("/logout", users.logoutUser)

module.exports = router;
