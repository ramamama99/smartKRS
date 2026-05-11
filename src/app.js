const express = require('express')
require('dotenv').config()

const authRoutes = require('./routes/auth')
const app = express()
app.use(express.json())

app.use('/api/auth',authRoutes)

app.get('/',(req,res) => {
    res.json({message: 'SmartKRS API is running'})
})

module.exports = app