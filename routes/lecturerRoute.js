const express = require("express");
const router = express.Router();
const upload = require("../config/upload");

const { registerLecturer, getLecturer, getLecturerByCourses, getLecturerData, getTotalCompletionvsOngoing, getDailyEnrollments, getTotalStudentsEnrolled, getAllUsersByCourse, updateLecturerProfile } = require("../controller/lecturerController")


router.post("/lecturer/:lecturerId", registerLecturer)
router.get("/lecturer/:userId", getLecturer)
router.get("/lecturer/:courseId", getLecturerByCourses)
router.get("/lecturer-data/:userId", getLecturerData)
router.get("/lecturer/completed-ongoing/:lecturerId", getTotalCompletionvsOngoing)
router.get("/lecturer/enrollments/:lecturerId", getDailyEnrollments)
router.get("/lecturer/total-students/:lecturerId", getTotalStudentsEnrolled)
router.get("/lecturer/students-by-courses/:courseId", getAllUsersByCourse)
router.put("/lecturer/:userId", upload.single("profilePic"), updateLecturerProfile)
module.exports = router