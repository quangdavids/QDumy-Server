const express = require("express");
const Cart = require("../model/cartSchema");
const Course = require("../model/courseSchema");
const Lecturer = require("../model/lecturerSchema");

// Get cart items
const getCartItems = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId })
      .populate({
        path: "items.courseId",
        populate: {
          path: 'lecturerId',
          select: 'lecturerName'
        }
      });
      
    const items = cart
      ? cart.items.map(item => ({
          _id: item.courseId._id,
          title: item.courseId.title,
          price: item.courseId.price,
          courseImage: item.courseId.courseImage,
          lecturer: item.courseId.lecturerId?.lecturerName || '',
          quantity: item.quantity
        }))
      : [];

    res.status(200).json({ 
      items
    });

  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


const addToCart = async (req, res) => {
  try {
    const { userId, quantity = 1 } = req.body;
    const { courseId } = req.params;

    let cart = await Cart.findOne({ userId });
    if (!cart) cart = new Cart({ userId, items: [] });

    const exists = cart.items.find(
      (item) => item.courseId.toString() === courseId
    );

    if (exists) {
      return res.status(400).json({ message: "Course already in cart" });
    }

    cart.items.push({ courseId, quantity });
    await cart.save();

    await cart.populate("items.courseId");

    const items = cart.items.map(item => ({
      _id: item.courseId._id,
      title: item.courseId.title,
      price: item.courseId.price,
      courseImg: item.courseId.courseImg,
      lecturer: item.courseId.lecturer,
      quantity: item.quantity
    }));

    res.status(201).json({ items });

  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Remove from cart
const removeFromCart = async (req, res) => {
  try {
    const { courseId } = req.body;

    const cart = await Cart.findOne({ userId: req.params.userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(
      item => item.courseId.toString() !== courseId
    );

    await cart.save();
    await cart.populate("items.courseId");

    const items = cart.items.map(item => ({
      _id: item.courseId._id,
      title: item.courseId.title,
      price: item.courseId.price,
      courseImg: item.courseId.courseImg,
      lecturer: item.courseId.lecturer,
      quantity: item.quantity
    }));

    res.status(200).json({ items });

  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = {
    getCartItems,
    addToCart,
    removeFromCart
};