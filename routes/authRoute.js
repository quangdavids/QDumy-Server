const express = require("express");
const router = express.Router();
const {register, login, logout,  refreshAccessToken} = require("../controller/authController");
const {authMiddleware} = require("../middlewares/authMiddlewares")
router.post("/register", register);
router.post("/login", login)
router.post("/logout", authMiddleware, logout)
router.post("/refresh-token", refreshAccessToken)

module.exports = router
