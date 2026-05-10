const express = require('express')
require('dotenv').config()

const app = express()

app.use(express.json())

app.get('/',(req,res) => {
    res.json({message: 'SmartKRS API is running'})
})

module.exports = app