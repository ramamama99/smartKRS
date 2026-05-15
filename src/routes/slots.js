const express = require('express')
const router = express.Router()
const { createSlot, getSlotsByCourse, getAllSlots, deleteSlot } = require('../controllers/slotController')
const authMiddleware = require('../middleware/auth')
const adminMiddleware = require('../middleware/adminMiddleware')

// GET semua slot
router.get('/', authMiddleware, getAllSlots)

// GET slot by course
router.get('/course/:course_id', authMiddleware, getSlotsByCourse)

// POST & DELETE — admin only
router.post('/', authMiddleware, adminMiddleware, createSlot)
router.delete('/:id', authMiddleware, adminMiddleware, deleteSlot)

module.exports = router