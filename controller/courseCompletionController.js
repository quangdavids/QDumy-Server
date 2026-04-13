const express = require("express");
const Course = require("../model/courseSchema");
const CourseCompletion = require("../model/courseCompletionSchema")
const Lesson = require("../model/lessonSchema");
const Lecturer = require("../model/lecturerSchema")
const markComplete = async (req, res) => {
  const { courseId, lessonId } = req.body;
  const userId = req.params.userId;

  const lecturerId = await Lecturer.findOne({ownedCourses: courseId})
  let progress = await CourseCompletion.findOne({
    userId: userId,
    courseId: courseId,
  });

  if (!progress) {
    progress = await CourseCompletion.create({
      userId: userId,
      courseId: courseId,
      lecturerId: lecturerId._id,
      lesson: lessonId,
      completedLessons: [],
    });
  }

  if (!progress.completedLessons.includes(lessonId)) {
    progress.completedLessons.push(lessonId);
    await progress.save();
  }

  const totalLessons = await Lesson.countDocuments({ courseId: courseId });

  const percent = Math.round(
    (progress.completedLessons.length / totalLessons) * 100,
  );

  // Update progress and set completionStatus if 100%
  const updateData = { progressPercent: percent };
  if (percent === 100) {
    updateData.completionStatus = "completed";
  }

  await CourseCompletion.findOneAndUpdate(
    { userId: userId, courseId: courseId },
    updateData,
  );


  res.status(200).json({
    message: "Lesson completion successful",
    progressPercent: percent,
  });
};

module.exports = { markComplete };
