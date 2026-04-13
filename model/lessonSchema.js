const mongoose = require("mongoose");
const { Schema } = mongoose;
const lessonSchema = Schema(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course" },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    videoUrl: { type: String, trim: true },
    videoPublicId: { type: String},
    duration: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lesson", lessonSchema);
