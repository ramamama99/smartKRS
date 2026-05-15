const pool = require('../db')

// CREATE slot kelas (admin only)
const createSlot = async (req, res) => {
    const { course_id, class_name, room, day, start_time, end_time, lecturer } = req.body

    if (!course_id || !class_name || !day || !start_time || !end_time) {
        return res.status(400).json({ message: 'course_id, class_name, day, start_time, end_time harus diisi' })
    }

    try {
        // Cek course_id valid
        const course = await pool.query('SELECT id FROM courses WHERE id = $1', [course_id])
        if (course.rows.length === 0) {
            return res.status(404).json({ message: 'Matkul tidak ditemukan' })
        }

        const result = await pool.query(
            `INSERT INTO class_slots (course_id, class_name, room, day, start_time, end_time, lecturer)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [course_id, class_name, room, day, start_time, end_time, lecturer]
        )

        res.status(201).json({
            message: 'Slot kelas berhasil ditambahkan',
            slot: result.rows[0]
        })

    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server error' })
    }
}

// GET semua slot by course_id
const getSlotsByCourse = async (req, res) => {
    const { course_id } = req.params

    try {
        const result = await pool.query(
            `SELECT cs.*, c.name as course_name, c.code, c.credits
             FROM class_slots cs
             JOIN courses c ON cs.course_id = c.id
             WHERE cs.course_id = $1
             ORDER BY cs.day, cs.start_time`,
            [course_id]
        )

        res.json({ slots: result.rows })

    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server error' })
    }
}

// GET semua slot (semua matkul sekaligus)
const getAllSlots = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT cs.*, c.name as course_name, c.code, c.credits
             FROM class_slots cs
             JOIN courses c ON cs.course_id = c.id
             ORDER BY c.name, cs.day, cs.start_time`
        )

        res.json({ slots: result.rows })

    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server error' })
    }
}

// DELETE slot (admin only)
const deleteSlot = async (req, res) => {
    const { id } = req.params

    try {
        const result = await pool.query(
            'DELETE FROM class_slots WHERE id = $1 RETURNING *',
            [id]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Slot tidak ditemukan' })
        }

        res.json({ message: 'Slot berhasil dihapus' })

    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server error' })
    }
}

module.exports = { createSlot, getSlotsByCourse, getAllSlots, deleteSlot }