const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = mongoose.Schema(
  {
    username: { type: String, required: true },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please add a valid email address.",
      ],
    },
    password: { type: String, required: true },
    authProvider: {
      type: String,
      enum: ["email", "google.com"],
      default: "email",
    },
    profileImg: {
      type: String,
      default:
        "https://media.istockphoto.com/id/1444077739/photo/college-study-and-education-student-man-portrait-with-back-to-school-backpack-and-portfolio.jpg?s=612x612&w=0&k=20&c=PAQmqKzYd3OiKhlfrT1DVMQNkGu-drX4rtJ5p6y7D8c=",
    },
    dateJoined: { type: Date, default: Date.now },
    review: [{ type: Schema.Types.ObjectId, ref: "Review" }],
    enrolledCourses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
    role: { type: String, enum: ["user", "admin"], default: "user" },
    status: { type: String, enum: ["Active", "Suspended"], default: "Active"},
    blockExpiresAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) {
    return next();
  }
});
module.exports = mongoose.model("User", userSchema);
