const pool = require('../db')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// utk register
const register = async (req,res) => {
    const {nim,name,email,password} = req.body


// input validation
if (!nim || !name || !email || !password){
    return res.status(400).json({
        message: 'Semua field harus diisi'
    })
}

if (password.length < 6){
    return res.status(400).json({
        message: 'Password minimal 6 karakter'
    })
}

try{
    const existing = await pool.query(
        'SELECT id FROM users WHERE nim = $1 OR email = $2',
        [nim,email]
    )
    if (existing.rows.length > 0){
        return res.status(409).json({
            message: 'NIM atau email sudah terdaftar'
        })
    }

    // HASH
    const password_hash = await bcrypt.hash(password,10)

    const result = await pool.query(
        `INSERT INTO users (nim,name,email,password_hash)
         VALUES ($1,$2,$3,$4)
         RETURNING id,nim,name,email,created_at`,
         [nim,name,email,password_hash]

    )
    await pool.query(
        'INSERT INTO user_preferences (user_id) VALUES ($1)',
        [result.rows[0].id]
    )
    res.status(201).json({
        message: 'Registrasi berhasil',
        user: result.rows[0]
    })
}catch (err){
    console.error(err)
    res.status(500).json({message:'Server error'})
}
}

// login
const login = async (req,res) => {
    const {email,password} = req.body

    if (!email || !password){
        return res.status(400).json({message: 'Email dan password harus diisi'})
    }
    try{
        const result = await pool.query(
            'SELECT * FROM users WHERE EMAIL = $1',
            [email]
        )

        if(result.rows.length === 0){
            return res.status(401).json({
                message: 'Email atau password salah'
            })
        }
        const user = result.rows[0]

        const isMatch = await bcrypt.compare(password,user.password_hash)
        if (!isMatch){
            return res.status(401).json({
                message: 'Email atau password salah'
            })
        }
        const token = jwt.sign(
            {userId: user.id},
            process.env.JWT_SECRET,
            { expiresIn: '1d'}
        )
        res.json({
            message:'Login berhasil',
            token,
            user:{
                id:user.id,
                nim:user.nim,
                name:user.name,
                email:user.email
            }
        })
    }catch (err){
        console.error(err)
        res.status(500).json({
            message:'Server error'
        })
    }
}

module.exports = {register,login}