const express = require("express")
const { getDailyRevenue, getTotalRevenue, getDailyRevenueByLecturer } = require("../controller/revenueController")
const router = express.Router()


router.get("/daily-revenue", getDailyRevenue)
router.get("/total-revenue", getTotalRevenue)
router.get("/daily-revenue/:lecturerId", getDailyRevenueByLecturer)
module.exports = router