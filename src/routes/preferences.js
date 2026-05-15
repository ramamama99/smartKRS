const express = require('express')
const router = express.Router()
const {getPreferences,updatePreferences} = require('../controllers/preferenceController')
const authMiddleware = require('../middleware/auth')

router.get('/',authMiddleware,getPreferences)
router.put('/',authMiddleware,updatePreferences)

module.exports = router