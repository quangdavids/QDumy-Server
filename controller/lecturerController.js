const Lecturer = require("../model/lecturerSchema");
const User = require("../model/userSchema");
const Course = require("../model/courseSchema");
const CourseCompletion = require("../model/courseCompletionSchema");
const { Mongoose } = require("mongoose");
const { default: mongoose } = require("mongoose");
const cloudinary = require("../config/cloudinary");
const getLecturer = async (req, res) => {
  try {
    const { userId } = req.params;
    const lecturer = await Lecturer.findOne({ lecturerId: userId }).populate(
      "ownedCourses",
    );
    if (!lecturer) {
      return res.status(404).json({ message: "Lecturer not found" });
    }
    res.status(200).json({
      message: "Lecturer fetched successfully",
      lecturer: lecturer._id,
    });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Failed to fetch lecturer", error: err.message });
  }
};

const getLecturerData = async (req, res) => {
  try {
    const { userId } = req.params;
    const lecturer = await Lecturer.findOne({ lecturerId: userId }).populate(
      "ownedCourses",
    );
    if (!lecturer) {
      return res.status(404).json({ message: "Lecturer not found" });
    }
    res
      .status(200)
      .json({ message: "Lecturer fetched successfully", lecturer: lecturer });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Failed to fetch lecturer", error: err.message });
  }
};

const registerLecturer = async (req, res) => {
  try {
    const { lecturerId } = req.params;
    const user = await User.findById(lecturerId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.findByIdAndUpdate(lecturerId, {isLecturer: true})

    // Check if lecturer already exists
    const existingLecturer = await Lecturer.findOne({ lecturerId: lecturerId });
    if (existingLecturer) {
      return res.status(400).json({ message: "Lecturer already registered" });
    }

    const newLecturer = new Lecturer({
      lecturerId: lecturerId,
      lecturerName: user.username,
      email: user.email,
      biography: "",
      socialLinks: {
        facebook: "",
        twitter: "",
        linkedin: "",
        link: "",
      },
      revenue: 0,
    });
    await newLecturer.save();
    res
      .status(201)
      .json({ message: "Lecturer registered successfully", lecturer: newLecturer });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to create lecturer", error: err.message });
  }
};

const getLecturerByCourses = async (req, res) => {
  try {
    const { courseId } = req.params;
    const lecturer = await Lecturer.findOne({ ownedCourses: courseId });
    res
      .status(200)
      .json({ message: "Lecturer found successfully", lecturer: lecturer._id });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch lecturer", error: err.message });
  }
};

const getTotalCompletionvsOngoing = async (req, res) => {
  try {
    const { lecturerId } = req.params;
    const ongoingCourses = await CourseCompletion.find({
      lecturerId: lecturerId,
      completionStatus: "ongoing",
    });
    const completedCourses = await CourseCompletion.find({
      lecturerId: lecturerId,
      completionStatus: "completed",
    });

    res.status(200).json({
      message: "Fetch course completion successfully",
      ongoing: ongoingCourses.length,
      completed: completedCourses.length,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch course completion",
      error: err.message,
    });
  }
};

const getDailyEnrollments = async (req, res) => {
  try {
    const { lecturerId } = req.params;

    const dailyEnrollments = await CourseCompletion.aggregate([
      {
        $match: { lecturerId: new mongoose.Types.ObjectId(lecturerId) },
      },
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
      message: "Fetch daily enrollments successfully",
      dailyEnrollments,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch daily enrollments",
      error: err.message,
    });
  }
};

const getTotalStudentsEnrolled = async (req, res) => {
  try {
    const { lecturerId } = req.params;

    const getTotalStudents = await Course.aggregate([
      {
        $match: { lecturerId: new mongoose.Types.ObjectId(lecturerId) },
      },
      {
        $group: {
          _id: null,

          totalStudents: { $sum: { $size: `$studentsEnrolled` } },
        },
      },
    ]);
    res.status(200).json({
      message: "Successfully get total students enrolled",
      totalStudent: getTotalStudents[0].totalStudents,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to get total students enrolled",
      err: err.message,
    });
  }
};
const getAllUsersByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const page = req.query.page || 1;
    const limit = req.query.limit || 6;
    const skip = limit * (page - 1);
    const students = await User.find({ enrolledCourses: courseId })
      .select("username email status")
      .skip(skip)
      .limit(limit);

    const totalStudents = await User.find({
      enrolledCourses: courseId,
    }).countDocuments();
    const totalPages = Math.ceil(totalStudents / limit);
    // Extract user IDs from students array
    const studentIds = students.map((student) => student._id);

    const completionData = await CourseCompletion.find({
      userId: { $in: studentIds },
      courseId: courseId,
    });

    // Create a map of userId to progressPercent
    const progressMap = {};
    completionData.forEach((completion) => {
      progressMap[completion.userId] = completion.progressPercent || 0;
    });

    const dateEnrolledMap = {};
    completionData.forEach((dateEnrolled) => {
      dateEnrolledMap[dateEnrolled.userId] =
        dateEnrolled.createdAt || new Date();
    });
    // Add progressPercent to each student
    const studentsWithProgress = students.map((student) => ({
      ...(student.toObject ? student.toObject() : student),
      progressPercent: progressMap[student._id] || 0,
      dateEnrolled: dateEnrolledMap[student._id],
    }));

    res
      .status(200)
      .json({
        students: studentsWithProgress,
        currentPage: page,
        totalPages: totalPages,
        totalStudents: totalStudents,
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateLecturerProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { lecturerName, email, jobTitle, biography, facebook, linkedin, twitter, personalLink } = req.body;

    // Find the lecturer by user ID
    const lecturer = await Lecturer.findOne({ lecturerId: userId });
    if (!lecturer) {
      return res.status(404).json({ message: "Lecturer not found" });
    }

    // Handle profile picture upload if file is provided
    let profilePicUrl = lecturer.profilePic;
    if (req.file) {
      try {
        const imageUploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "instructor_profiles",
              resource_type: "image",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(req.file.buffer);
        });
        profilePicUrl = imageUploadResult.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary Upload error", uploadError);
        return res.status(400).json({
          message: "Failed to upload profile picture",
          error: uploadError.message,
        });
      }
    }

    // Update lecturer profile
    const updateData = {
      lecturerName: lecturerName || lecturer.lecturerName,
      email: email || lecturer.email,
      jobTitle: jobTitle || lecturer.jobTitle,
      biography: biography || lecturer.biography,
      profilePic: profilePicUrl,
      socialLinks: {
        facebook: facebook || lecturer.socialLinks?.facebook || "",
        twitter: twitter || lecturer.socialLinks?.twitter || "",
        linkedin: linkedin || lecturer.socialLinks?.linkedin || "",
        link: personalLink || lecturer.socialLinks?.link || "",
      },
    };

    const updatedLecturer = await Lecturer.findOneAndUpdate(
      { lecturerId: userId },
      updateData,
      { new: true }
    );

    res.status(200).json({
      message: "Lecturer profile updated successfully",
      lecturer: updatedLecturer,
    });
  } catch (err) {
    console.error("Error updating lecturer profile:", err);
    res.status(500).json({
      message: "Failed to update lecturer profile",
      error: err.message,
    });
  }
};

module.exports = {
  getLecturer,
  registerLecturer,
  getLecturerData,
  getLecturerByCourses,
  getTotalCompletionvsOngoing,
  getDailyEnrollments,
  getTotalStudentsEnrolled,
  getAllUsersByCourse,
  updateLecturerProfile,
};
