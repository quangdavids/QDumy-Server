const User = require("../model/userSchema");
const Course = require("../model/courseSchema");
const courseCompletion = require("../model/courseCompletionSchema");
const Lesson = require("../model/lessonSchema");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");
// Get all students
// const getAllUsers = async (req, res) => {
//     try {
//         const students = await Student.find();
//         res.status(200).json(students);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };
const getNumberOfUsers = async (req, res) => {
  try {
    const users = await User.countDocuments({});
    res.status(200).json({ message: "Fetch users successfully", users: users });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error in fetching number of users", err: err.message });
  }
};


const getUserAnalytics = async (req, res) => {
  try {
    const { userId } = req.params;

    const listOfOngoingCourses = await courseCompletion.countDocuments({
      userId: userId,
      completionStatus: "ongoing",
    });

    const listOfCompletedCourses = await courseCompletion.countDocuments({
      userId: userId,
      completionStatus: "completed",
    });

    const user = await User.findById(userId);

    const numOfEnrolledCourses = user.enrolledCourses.length;

    res.status(201).json({
      message: `Number of course is ${numOfEnrolledCourses}`,
      courseNumber: numOfEnrolledCourses,
      ongoing: listOfOngoingCourses,
      completed: listOfCompletedCourses,
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

const getCompletedAndRemaining = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = [];
    const findProgress = await courseCompletion.find({ userId: userId });

    for (const item of findProgress) {
      const totalLessons = await Lesson.countDocuments({
        courseId: item.courseId,
      });
      const completed = item.completedLessons.length;
      const remaining = totalLessons - completed;
      const course = await Course.findById(item.courseId);
      result.push({
        courseTitle: course.title,
        completed,
        remaining,
      });
      // const completedLesson = findProgress.completedLessons.length
    }
    res
      .status(200)
      .json({
        message: "Fetch completed lessons successfully",
        progress: result,
      });
  } catch (err) {
    res
      .status(500)
      .json({ message: "error in fetching data", err: err.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const userData = await User.findById(userId).select(
      "profileImg username email",
    );

    res
      .status(200)
      .json({ message: "User found successfully", userData: userData });
  } catch (err) {
    res.status(500).json({ message: "Server error", err: err.message });
  }
};

const editUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const {username, email}= req.body;

    let profileImg = null;
    const isUserFound = await User.findById(userId);
    if (!isUserFound) {
      return res.status(404).json("Failed to find user");
    }
    if (req.file) {
      const imageFile = req.file;
      try {
        const imageUploadResult = await cloudinary.uploader.upload(
          imageFile.path,
          {
            folder: "profile_images",
            resource_type: "image",
          },
        );
        profileImg = imageUploadResult.secure_url;
        fs.unlinkSync(imageFile.path);
      } catch (uploadError) {
        console.error("Cloudinary Upload error", uploadError);
        return res.status(400).json({
          message: "Failed to upload profile image.",
          error: uploadError,
        });
      }
    }
    const updateData = {
      username: username,
      email: email,
    };
    if (profileImg) {
      updateData.profileImg = profileImg;
    }
    const profileEdit = await User.findByIdAndUpdate(userId, 
      updateData, {
      new: true,
    });
    res
      .status(200)
      .json({ message: "Profile updated successfully", message: profileEdit });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Failed to update profile", err: err.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit;

    const findUsers = await User.find({role: {$ne: 'admin'}}).skip(skip).limit(limit).exec();

    const totalUsers = await User.countDocuments();
    const totalPages = Math.ceil(totalUsers / limit);

    res
      .status(200)
      .json({
        message: "Fetch all users successfully",
        users: findUsers,
        currentPage: page,
        totalUsers: totalUsers,
        totalPages: totalPages,
      });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Fetch all users failed", err: err.message });
  }
};

module.exports = {
  getNumberOfUsers,
  getUserProfile,

  editUserProfile,
  getUserAnalytics,
  getCompletedAndRemaining,
  getAllUsers
};
