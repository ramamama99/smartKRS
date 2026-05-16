const express = require('express')
const router = express.Router()
const { generate, saveDraft, getMySchedules,deleteDraft} = require('../controllers/scheduleController')
const authMiddleware = require('../middleware/auth')

router.post('/generate', authMiddleware, generate)
router.post('/save', authMiddleware, saveDraft)
router.get('/my', authMiddleware, getMySchedules)
router.delete('/:id',authMiddleware,deleteDraft)

module.exports = router