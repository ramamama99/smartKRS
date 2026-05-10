const app = require('./src/app')
require('./src/db')

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`SmartKRS running on port ${PORT}`)
})