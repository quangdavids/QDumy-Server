const Lecturer = require("../model/lecturerSchema");
const User = require("../model/userSchema");
const Review = require("../model/reviewSchema");
const Course = require("../model/courseSchema")

const addReviewToCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { userId } = req.params;
    const { content, rating } = req.body;

    const course = await Course.findById(courseId);
    const user = await User.findById(userId);
    const newReview = await Review.create({
      courseId,
      userId,
      content,
      rating,
    });



    const allReviews = await Review.find({courseId})
    const averageRating = allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length
    course.rating = averageRating


    course.review.push(newReview._id);
    user.review.push(newReview._id);
    await course.save();
    await user.save();
    const review = await Review.findById(newReview._id).populate({
      path: "userId",
      select: "username",
    });

    res.status(200).json({ message: "Review added", review, course: course, rating:averageRating });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Review can't be created", error: err.message });
  }
};

const editReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const updatedReview = await Review.findByIdAndUpdate(reviewId, req.body);
    res
      .status(200)
      .json({ message: "Review updated successfully", updatedReview });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error in updating review", error: err.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const review = await Review.findByIdAndDelete(reviewId);
    res.status(200).json({ message: "Review deleted successfully", review });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error in deleting review", error: err.message });
  }
};

const getUserReview = async (req,res) => {
  try {
  const { courseId, userId } = req.params
  const review = await Review.findOne({courseId: courseId, userId: userId}).populate("userId","profileImg username")
  res.status(200).json(review)
  } catch (err) {
    res.status(400).json({message:"Can't fetch a user review", err: err.message})
  }
}
const getReviewsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    // const course = await Course.findById(courseId).populate("review ");
    const review = await Review.find({courseId: courseId})
    .populate("userId", "profileImg username").limit(4)

    res
      .status(200)
      .json({ message: "Review fetched successfully", reviews: review });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Can't fetch reviews", error: err.message });
  }
};

module.exports = { addReviewToCourse, editReview, deleteReview, getReviewsByCourse, getUserReview}