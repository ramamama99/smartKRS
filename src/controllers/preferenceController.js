const pool = require('../db')

// GET preferensi user yang login
const getPreferences = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM user_preferences WHERE user_id = $1',
            [req.userId]
        )

        res.json({ preferences: result.rows[0] })

    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server error' })
    }
}

// UPDATE preferensi user
const updatePreferences = async (req, res) => {
    const { allowed_days, latest_end_time, max_gap_minutes } = req.body

    // Validasi allowed days
    if (allowed_days && !Array.isArray(allowed_days)) {
        return res.status(400).json({ message: 'allowed_days harus berupa array' })
    }

    // Validasi hari
    const validDays = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    if (allowed_days) {
        const invalidDays = allowed_days.filter(d => !validDays.includes(d))
        if (invalidDays.length > 0) {
            return res.status(400).json({ message: `Hari tidak valid: ${invalidDays.join(', ')}` })
        }
    }

    try {
        const result = await pool.query(
            `UPDATE user_preferences
             SET allowed_days = COALESCE($1, allowed_days),
                 latest_end_time = COALESCE($2, latest_end_time),
                 max_gap_minutes = COALESCE($3, max_gap_minutes),
                 updated_at = NOW()
             WHERE user_id = $4
             RETURNING *`,
            [allowed_days, latest_end_time, max_gap_minutes, req.userId]
        )

        res.json({
            message: 'Preferensi berhasil diupdate',
            preferences: result.rows[0]
        })

    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server error' })
    }
}

module.exports = { getPreferences, updatePreferences }