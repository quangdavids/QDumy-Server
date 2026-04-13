const express = require("express");
const router = express.Router();
const {markComplete} = require('../controller/courseCompletionController')

router.post("/progress/mark-complete/:userId", markComplete);


module.exports = router