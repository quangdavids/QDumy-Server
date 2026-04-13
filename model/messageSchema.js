const mongoose = require("mongoose");
const { Schema } = mongoose;

const recommendationSchema = new Schema({
  courseId: {
    type: Schema.Types.ObjectId,
    ref: "Course",
  },
  title: String,
  price: Number,
  courseImage: String,
  reason: String,
}, { _id: false });

const messageSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    role: {
      type: String,
      enum: ["user", "bot"],
      required: true,
    },

    content: {
      type: String,
      required: true,
    },

    recommendations: {
      type: [recommendationSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
