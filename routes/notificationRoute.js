const express = require("express");
const { getNotification, readNotification, deleteNotification, getLecturerNotification, readNotificationRealTime, deleteNotificationRealTime } = require("../controller/notificationController");
const router = express.Router();


router.get("/notification/lecturer/:userId", getLecturerNotification)
router.get("/notification/:userId", getNotification)
router.put("/notification/read/:notificationId", readNotificationRealTime)
router.delete("/notification/:notificationId", deleteNotificationRealTime)

module.exports = router