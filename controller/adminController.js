const Course = require("../model/courseSchema");
const User = require("../model/userSchema");
const bcrypt = require("bcrypt");
const Lecturer = require("../model/lecturerSchema");
const Notification = require("../model/notificationSchema");
const CourseCompletion = require("../model/courseCompletionSchema");
const { generateToken } = require("../config/jwt");

const loginAsAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    // Find user by username
    const admin = await User.findOne({ username });
    if (!admin) {
      return res.status(400).json({ message: "Admin not found" });
    }

    // Check if user has admin role
    if (admin.role !== "admin") {
      return res
        .status(403)
        .json({ message: "User does not have admin permissions" });
    }

    // Compare password
    const isPasswordMatch = await bcrypt.compare(password, admin.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    
  

    // Generate token
    const token = generateToken(
      { userId: admin._id },
      res,
    );

    res.status(200).json({
      message: "Admin login successful",
      admin: {
        _id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
      token: token,
  
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({
      message: "Failed to login as admin",
      error: error.message || "Unknown error",
    });
  }
};

const getPendingCourses = async (req, res) => {
  try {
    const findCourses = await Course.find({
      status: { $ne: "draft" },
    }).populate("lecturerId", "lecturerName profilePic");

    const pendingCourses = [];
    const publishedCourses = [];
    const rejectedCourses = [];
    for (const course of findCourses) {
      if (course.status === "pending") {
        pendingCourses.push(course);
      } else if (course.status === "published") {
        publishedCourses.push(course);
      } else if (course.status === "rejected") {
        rejectedCourses.push(course);
      }
    }
    res.status(200).json({
      message: "Find courses successfully",
      pendingCourses: pendingCourses,
      publishedCourses: publishedCourses,
      rejectedCourses: rejectedCourses,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Server error in finding courses", error: err.message });
  }
};

const publishCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findByIdAndUpdate(
      courseId,
      {
        status: "published",
      },
      { new: true },
    );
    const findLecturer = await Lecturer.findOne({ ownedCourses: courseId });

    const notification = await Notification.create({
      lecturerId: findLecturer._id,
      message: `Your course ${course.title} has been published`,
      link: "/instructor/course",
    });
    
    const io = req.app.get('socketio');
    if (io && findLecturer.lecturerId) {
      io.to(findLecturer.lecturerId.toString()).emit('new-notification', notification);
    }
    
    res.status(200).json({
      message: "Course published successfully",
      status: course.status,
      notification: notification,
      lecturer: findLecturer,
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

const rejectCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findByIdAndUpdate(
      courseId,
      {
        status: "rejected",
      },
      { new: true },
    );

    const findLecturer = await Lecturer.findOne({ ownedCourses: courseId });

    const notification = await Notification.create({
      lecturerId: findLecturer._id,
      message: `Your course ${course.title} has been rejected`,
      link: "/instructor/course",
    });
    
  
    const io = req.app.get('socketio');
    if (io && findLecturer.lecturerId) {
      io.to(findLecturer.lecturerId.toString()).emit('new-notification', notification);
    }
    
    res.status(200).json({
      message: "Course rejected successfully",
      status: course.status,
      notification: notification,
      lecturer: findLecturer,
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      message: "User deleted successfully",
    });
  } catch {
    res.status(500).json({
      message: "Error in deleting the user",
    });
  }
};

const getGeneralWeeklyEnrollments = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const weeklyEnrollments = await CourseCompletion.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%d-%m-%Y", date: "$createdAt" },
          },
          totalEnrollments: { $sum: 1 },
        },
      },
      {
        $limit: 7,
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    res.status(200).json({
      message: "Fetch weekly enrollments successfully",
      weeklyEnrollments,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch weekly enrollments",
      error: err.message,
    });
  }
};

const getUserGrowth = async (req, res) => {
  try {
    const dailyUsers = await User.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: "%d-%m-%Y", date: "$dateJoined" },
          },
          dailyUser: { $sum: 1 },
          date: { $first: "$dateJoined" },
        },
      },

      {
        $sort: {
          date: 1,
        },
      },
    ]);

    res.status(200).json({
      message: "Fetch user growth successfully",
      dailyUsers,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch daily enrollments",
      error: err.message,
    });
  }
};

const blockUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await User.findByIdAndUpdate(userId, {
      blockExpiresAt: expiryDate,
      status: "Suspended",
    });

    res.status(200).json({ message: "User blocked successfully" });
  } catch (err) {
    res.status(500).json({ message: "User block failed", err: err.message });
  }
};
module.exports = {
  loginAsAdmin,
  getPendingCourses,
  publishCourse,
  rejectCourse,
  deleteUser,
  getGeneralWeeklyEnrollments,
  getUserGrowth,
  blockUser,
};
