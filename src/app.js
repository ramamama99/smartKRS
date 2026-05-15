const express = require('express')
require('dotenv').config()

const authRoutes = require('./routes/auth')
const courseRoutes = require('./routes/courses')
const authMiddleware = require('./middleware/auth')
const slotRoutes = require('./routes/slots')

const app = express()
app.use(express.json())

app.use('/api/auth',authRoutes)
app.use('/api/courses',courseRoutes)
app.use('/api/slots',slotRoutes)

app.get('/api/profile', authMiddleware, (req, res) => {
    res.json({ message: 'Kamu berhasil akses endpoint protected!', userId: req.userId })
})

app.get('/',(req,res) => {
    res.json({message: 'SmartKRS API is running'})
})

module.exports = app