const express = require("express");
const router = express.Router();
const { getRecommendation, getMessages } = require('../controller/aiController')

router.post('/recommend/:userId', getRecommendation)
router.get('/messages/:userId', getMessages)
module.exports = router