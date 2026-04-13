const mongoose = require("mongoose");
const { Schema } = mongoose;

const dailyLecturerRevenueSchema = Schema(
  {
    lecturerId: { type: Schema.Types.ObjectId, ref: "Lecturer" },
    courseId: { type: Schema.Types.ObjectId, ref: "Course" },
    revenue: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model(
  "DailyLecturerRevenue",
  dailyLecturerRevenueSchema,
);
