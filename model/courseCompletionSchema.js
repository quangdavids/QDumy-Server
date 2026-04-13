const mongoose = require("mongoose");
const { Schema } = mongoose;

const courseCompletion = Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    courseId: { type: Schema.Types.ObjectId, ref: "Course" },
    lecturerId: { type:Schema.Types.ObjectId, ref: "Lecturer"},
    completionStatus: {
      type: String,
      enum: ["ongoing", "completed"],
      default: "ongoing",
    },
    completedLessons: [{ type: Schema.Types.ObjectId, ref: "Lesson" }],
    progressPercent: {type: Number, default: 0, max: 100}
  },
  { timestamps: true },
);

module.exports = mongoose.model("CourseCompletion", courseCompletion);
