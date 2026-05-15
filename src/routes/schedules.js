const express = require('express')
const router = express.Router()
const { generate, saveDraft, getMySchedules } = require('../controllers/scheduleController')
const authMiddleware = require('../middleware/auth')

router.post('/generate', authMiddleware, generate)
router.post('/save', authMiddleware, saveDraft)
router.get('/my', authMiddleware, getMySchedules)

module.exports = router