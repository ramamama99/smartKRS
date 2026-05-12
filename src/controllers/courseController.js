const pool = require('../db')

// create matkul khusus admin

const createCourse = async (req,res) => {
    const {code,name,credits,type,semester_level} = req.body

    if(!code || !name || !credits){
        return res.status(400).json({
            message: 'Code,name,dan credits harus diisi'
        })
    }
    try{
        const result = await pool.query(
            `INSERT INTO courses (code,name,credits,type,semester_level)
            VALUES ($1,$2,$3,$4,$5)
            RETURNING *`,
            [code,name,credits,type || 'wajib',semester_level || 4]
        )
        res.status(201).json({
            message:'Matkul berhasil ditambahkan',
            course:result.rows[0]
        })
    }catch (err){
        console.error(err)
        res.status(500).json({message:'server error'})
    }
}

const getCourses = async (req,res) => {
    try{
        const result = await pool.query(
            'SELECT * FROM courses ORDER By type,semester_level, name'
        )
        res.json({courses:result.rows})
    }catch (err){
        console.error(err)
        res.status(500).json({message:'Server error'})
    }
}

const deleteCourse = async (req,res) => {
    const {id} = req.params

    try{
        const result = await pool.query(
            'DELETE FROM courses WHERE id = $1 RETURNING *',
            [id]
        )
        if (result.rows.length === 0){
            return res.status(404).json({message:'Matkul tidak ditemukan'})
        }
        res.json({message: 'Matkul berhasil dihapus'})
    }catch (err){
        console.error(err)
        res.status(500).json({message: 'Server error'})
    }
}
module.exports = {createCourse,getCourses,deleteCourse}