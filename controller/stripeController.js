const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Order = require("../model/orderSchema");
const Cart = require("../model/cartSchema");
const CourseCompletion = require("../model/courseCompletionSchema")
const User = require("../model/userSchema");
const Lecturer = require("../model/lecturerSchema")
const Course = require('../model/courseSchema')
const Revenue = require('../model/revenueSchema')
const DailyLecturerRevenue = require('../model/dailyLecturerRevenueSchema')
const Notification = require('../model/notificationSchema')
// Create checkout session
const createCheckoutSession = async (req, res) => {
  try {
    const { courses } = req.body;
    // Handle both Firebase (uid) and JWT (userId) token formats
    const userId = req.user?.userId || req.user?._id || req.user?.uid;

    if (!userId) {
      return res.status(400).json({ message: "User not authenticated" });
    }

    console.log("Creating checkout session for userId:", userId);
    console.log("Courses received:", JSON.stringify(courses, null, 2));

    if (!Array.isArray(courses) || courses.length === 0) {
      return res.status(400).json({ message: "Invalid products in cart" });
    }

    let totalAmount = 0;

    const courseItems = courses.map((course) => {
      // Ensure price is a number
      const price = parseFloat(course.price) || 0;
      if (isNaN(price)) {
        throw new Error(
          `Invalid price for course ${course.title}: ${course.price}`
        );
      }

      console.log(`Course: ${course.title}, Price: ${price}`);

      const amount = Math.round(price * 100);
      totalAmount += amount * (course.quantity || 1);

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: course.title,
            description: course.title,
            images: course.courseImg ? [course.courseImg] : [],
          },
          unit_amount: amount,
        },
        quantity: course.quantity || 1,
      };
    });

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: courseItems,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/payment-cancel`,
      metadata: {
        userId: userId.toString(),
        courses: JSON.stringify(
          courses.map((c) => ({
            courseId: c._id,
            quantity: c.quantity || 1,
            price: c.price,
          }))
        ),
      },
    });

    console.log("Stripe session created:", session.id);
    console.log(
      "Success URL:",
      `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`
    );

    // Create order record
    const order = new Order({
      userId,
      courses: courses.map((c) => ({
        courseId: c._id,
        quantity: c.quantity || 1,
        price: c.price,
      })),
      totalAmount: totalAmount / 100,
      stripeSessionId: session.id,
      paymentStatus: "pending",
    });

    await order.save();

    res.status(200).json({ url: session.url, id: session.id, orderId: order._id });
  } catch (error) {
    console.error("Error processing checkout", error);
    res.status(500).json({
      message: "Error checkout server",
      error: error.message,
    });
  }
};

// Verify payment after Stripe redirect
const verifyPayment = async (req, res) => {
  try {
    const { session_id, userId: queryUserId } = req.query;
    
    const userId = req.user?.userId || req.user?._id || req.user?.uid || queryUserId;

    if (!session_id) {
      return res.status(400).json({ message: "Session ID is required" });
    }

    if (!userId) {
      return res.status(401).json({ message: "User ID is required" });
    }

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Find order
    const order = await Order.findOne({ stripeSessionId: session_id }).populate(
      "courses.courseId"
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Verify user owns this order
    if (order.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Update order if payment is successful
    if (session.payment_status === "paid") {
      order.paymentStatus = "completed";
      order.stripePaymentIntentId = session.payment_intent;
      await order.save();

      // Clear user's cart
      await Cart.findOneAndUpdate({ userId }, { items: [] });

      // Enroll user in courses - add all purchased courses to enrolledCourses
      const courseIds = order.courses.map(
        (course) => course.courseId._id || course.courseId
      );

      const user = await User.findByIdAndUpdate(
        userId,
        { $addToSet: { 
          enrolledCourses: { $each: courseIds } } },
        { new: true }
      ).populate("enrolledCourses");

     

      // Update lecturer revenue for each course sold
      for (const course of order.courses) {
        const courseData = course.courseId;
       
        const revenueFromCourse = parseFloat(course.price) * (course.quantity || 1) * 0.9;
        
        await Revenue.create({revenue: revenueFromCourse * 0.1})
        await Notification.create({message: `Check out your ${course.quantity} new bought courses`, userId: userId, link: "/user/my-courses"})
        await DailyLecturerRevenue.create({revenue: revenueFromCourse, lecturerId: courseData.lecturerId})

        console.log(`\nProcessing course: ${courseData.title}`);
        console.log(`Course price: ${course.price}, Quantity: ${course.quantity || 1}`);
        console.log(`Revenue from course: $${revenueFromCourse}`);
        console.log(`Lecturer ID: ${courseData.lecturerId}`);
        
        if (courseData.lecturerId) {
          const updatedLecturer = await Lecturer.findByIdAndUpdate(
            courseData.lecturerId,
            { $inc: { revenue: revenueFromCourse } },
            { new: true, upsert: true }
          );

          const updatedCourse = await Course.findByIdAndUpdate(
            courseData,
            { $push: { studentsEnrolled: userId }},
            { new: true }
          )
          console.log(
            `Lecturer ${courseData.lecturerId} earned $${revenueFromCourse} from course ${courseData.title}`
          );

          
          console.log(`New lecturer revenue: $${updatedLecturer?.revenue || 'ERROR'}\n`);
          console.log(`Course ${courseData} adds user ${userId}`)
        } else {
          console.log(`No lecturerId found for course ${courseData.title}\n`);
        }
      }

      console.log(`User ${userId} enrolled in ${courseIds.length} courses`)

      
      return res.status(200).json({
        message: "Payment verified successfully",
        order,
        paymentStatus: "completed",
        enrolledCourses: user.enrolledCourses,
       
      });
    }

    res.status(400).json({
      message: "Payment not completed",
      paymentStatus: session.payment_status,
    });
  } catch (error) {
    console.error("Error verifying payment", error);
    res.status(500).json({
      message: "Error verifying payment",
      error: error.message,
    });
  }
};



module.exports = {
  createCheckoutSession,
  verifyPayment,
  // stripeWebhook,
};
