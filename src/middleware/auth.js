    const jwt = require('jsonwebtoken')
    const pool = require('../db')

    const authMiddleware = async(req,res,next) => {
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]

        if(!token){
            return res.status(401).json({message: 'Token tidak ditemukan'})
        }
    try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET)

            // Ambil data user dari DB termasuk role
            const result = await pool.query(
                'SELECT id, name, role FROM users WHERE id = $1',
                [decoded.userId]
            )

            if (result.rows.length === 0) {
                return res.status(401).json({ message: 'User tidak ditemukan' })
            }

            req.userId = result.rows[0].id
            req.userRole = result.rows[0].role
            req.userName = result.rows[0].name

            next()

        } catch (err) {
            return res.status(403).json({ message: 'Token tidak valid' })
        }
    }
    module.exports = authMiddleware