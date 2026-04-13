const mongoose = require("mongoose");
const { Schema } = mongoose;

const courseSchema = mongoose.Schema(
  {
    title: { type: String },
    introduction: { type: String },
    lecturerId: { type: Schema.Types.ObjectId, ref: "Lecturer" },
    // ownedByLecturer: { type: Schema.Types.ObjectId, ref: "Lecturer"},
    courseImage: { type: String },
    requirements: [{ type: String }],
    learningQualities: [{ type: String }],
    promotionalVideo: { type: String },
    price: { type: Number, min: 0 },
    lessons: [
      {
        type: Schema.Types.ObjectId,
        ref: "Lesson",
      },
    ],
    rating: { type: Number, default: 0},
    description: { type: String },
    category: { type: String },
    level: { type: String },
    review: [{ type: Schema.Types.ObjectId, ref: "Review" }],
    quizzes: [{type: Schema.Types.ObjectId, ref: "Quiz"}],
    studentsEnrol: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["draft","pending", "published", "rejected"],
      default: "draft",
    },

    // isPublished: { type: Boolean, default: false },

    studentsEnrolled: [{ type: Schema.Types.ObjectId, ref: "User"}],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);
