const express = require("express");
const router = express.Router();
const Cart = require("../model/cartSchema");

const { getCartItems, addToCart, removeFromCart } = require("../controller/cartController");

router.get("/items/:userId", getCartItems);
router.post("/add/:courseId", addToCart);
router.delete("/remove/:userId", removeFromCart);

module.exports = router;