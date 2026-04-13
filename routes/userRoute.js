const express = require("express");
const router = express.Router();
const {
  editUserProfile,
  getUserAnalytics,
  getUserProfile,
  getNumberOfUsers,
  getCompletedAndRemaining,
  getAllUsers,

} = require("../controller/userController");
const { authMiddleware } = require("../middlewares/authMiddlewares");
const upload = require("../config/upload");

router.get("/total", getNumberOfUsers);
router.get("/info/:userId", authMiddleware, getUserProfile);
router.get("/analytic/:userId", getUserAnalytics);
router.put(
  "/edit/:userId",
  upload.single("profileImg"),
  authMiddleware,
  editUserProfile
);
router.get("/lesson-comparison/:userId", getCompletedAndRemaining);
router.get("/all", getAllUsers);

module.exports = router;
