const express = require('express')
const cors = require('cors')
require('dotenv').config()

const authRoutes = require('./routes/auth')
const courseRoutes = require('./routes/courses')
const authMiddleware = require('./middleware/auth')
const slotRoutes = require('./routes/slots')
const preferenceRoutes = require('./routes/preferences')
const scheduleRoutes = require('./routes/schedules')

const app = express()

app.use(cors({
    origin: '*',
    methods: ['GET,POST','PUT','DELETE'],
    allowedHeaders:['Content-Type','Authorization']
}))

app.use(express.json())

app.use('/api/auth',authRoutes)
app.use('/api/courses',courseRoutes)
app.use('/api/slots',slotRoutes)
app.use('/api/preferences',preferenceRoutes)
app.use('/api/schedules', scheduleRoutes)

app.get('/api/profile', authMiddleware, (req, res) => {
    res.json({ message: 'Kamu berhasil akses endpoint protected!', userId: req.userId })
})

app.get('/',(req,res) => {
    res.json({message: 'SmartKRS API is running'})
})

module.exports = app