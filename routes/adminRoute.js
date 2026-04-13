const express = require("express");
const router = express.Router();
const {loginAsAdmin, getPendingCourses, publishCourse, rejectCourse, deleteUser, getGeneralWeeklyEnrollments, getUserGrowth, blockUser} = require('../controller/adminController')
const { isAdmin } = require('../middlewares/adminMiddlewares')

router.post('/admin/login',  loginAsAdmin)
router.get('/admin/courses',  getPendingCourses)
router.get('/admin/weekly-enrollments', getGeneralWeeklyEnrollments)
router.get('/admin/user-growth', getUserGrowth)
router.put('/admin/block/:userId', blockUser)
router.put('/admin/publish/:courseId', publishCourse)
router.put('/admin/reject/:courseId',  rejectCourse)
router.delete('/admin/delete-user/:userId', deleteUser)

module.exports = router