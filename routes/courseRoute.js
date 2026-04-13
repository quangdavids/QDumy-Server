const express = require("express");
const router = express.Router();
const upload = require("../config/upload");
const {
  getAllCourses,
  getCourseById,
  getLatestCourses,
  searchCourse,
  addCourse,
  updateCourse,
  deleteCourse,
  addLessonToCourse,
  updateLessonInCourse,
  getCourseLessons,
  getCoursesByLecturer,
  checkCourseBoughtStatus,
  getEnrolledCourses,
  submitCourseForApproval,
  getLessonDetails,
  searchOwnedCourse,
  getTotalLessonDuration,
} = require("../controller/courseController");


router.get("/courses/search", searchCourse);
router.get("/courses/search/:userId", searchOwnedCourse)
router.get("/courses/bought/:userId/:courseId", checkCourseBoughtStatus)
router.get("/courses", getAllCourses);
router.get("/courses/latest", getLatestCourses);
router.get("/courses/owned/:userId", getEnrolledCourses)
router.get("/courses/:id", getCourseById);
router.get("/courses/list/:lecturerId", getCoursesByLecturer);
router.post(
  "/courses",
  upload.fields([
    { name: "courseImage", maxCount: 1 },
    { name: "promotionalVideo", maxCount: 1 },
  ]),
  addCourse
);
router.post(
  "/courses/:courseId/lessons",
  upload.single("video"),
  addLessonToCourse
);
router.get("/courses/total-time/:courseId", getTotalLessonDuration)
router.get("/courses/:courseId/:userId/lessons", getCourseLessons);
router.get("/courses/:courseId/lessons", getCourseLessons);
router.get("/courses/:lessonId/:userId/lessons/details", getLessonDetails)
router.get("/courses/:lessonId/lessons/details", getLessonDetails)
router.put("/:courseId/lessons/:lessonId", upload.single("video"), updateLessonInCourse);
router.put(
  "/courses/:courseId",
  upload.fields([
    { name: "courseImage", maxCount: 1 },
    { name: "promotionalVideo", maxCount: 1 },
  ]),
  updateCourse
);

router.put("/courses/submission/:courseId", submitCourseForApproval)

router.delete("/courses/:courseId", deleteCourse);

//exporting the router
module.exports = router;
