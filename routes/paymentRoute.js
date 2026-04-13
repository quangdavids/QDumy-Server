const express = require("express")
const router = express.Router()
const { createCheckoutSession, verifyPayment } = require("../controller/stripeController")
const { authMiddleware } = require("../middlewares/authMiddlewares")


router.post("/create-checkout-session", authMiddleware, createCheckoutSession)
router.get("/verify-payment", authMiddleware, verifyPayment)

module.exports = router
