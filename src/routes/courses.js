const express = require('express')
const router = express.Router()
const {createCourse,getCourses,deleteCourse} = require('../controllers/courseController')
const authMiddleware = require('../middleware/auth')
const adminMiddleware = require('../middleware/adminMiddleware')

router.get('/',authMiddleware,getCourses)

router.post('/',authMiddleware,adminMiddleware,createCourse)
router.delete('/:id', authMiddleware,adminMiddleware,deleteCourse)

module.exports = router
