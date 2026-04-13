const express = require("express");
const router = express.Router();

const { getReviewsByCourse, addReviewToCourse, editReview, deleteReview, getUserReview} = require('../controller/reviewController')


router.get("/reviews/:courseId", getReviewsByCourse);
router.get("/review/:courseId/:userId", getUserReview)
router.post("/review/:courseId/:userId", addReviewToCourse);
router.put("/review/:reviewId", editReview);
router.delete("/review/:reviewId", deleteReview);

module.exports = router