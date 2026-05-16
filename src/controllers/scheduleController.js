const pool = require('../db')
const { generateSchedules } = require('../services/scheduleGenerator')

const generate = async (req, res) => {
    const { course_ids } = req.body

    if (!course_ids || !Array.isArray(course_ids) || course_ids.length === 0) {
        return res.status(400).json({ message: 'course_ids harus berupa array dan tidak boleh kosong' })
    }

    try {
        const prefResult = await pool.query(
            'SELECT * FROM user_preferences WHERE user_id = $1',
            [req.userId]
        )

        const preferences = prefResult.rows[0]

        if (!preferences || preferences.allowed_days.length === 0) {
            return res.status(400).json({ message: 'Atur preferensi hari terlebih dahulu' })
        }

        const slotsByCourse = []
        for (const courseId of course_ids) {
            const result = await pool.query(
                `SELECT cs.*, c.name as course_name, c.code, c.credits
                 FROM class_slots cs
                 JOIN courses c ON cs.course_id = c.id
                 WHERE cs.course_id = $1`,
                [courseId]
            )

            if (result.rows.length === 0) {
                return res.status(404).json({ message: `Tidak ada slot untuk course_id: ${courseId}` })
            }

            slotsByCourse.push(result.rows)
        }

        const variations = generateSchedules(slotsByCourse, preferences)

        if (variations.length === 0) {
            return res.status(200).json({
                message: 'Tidak ada jadwal yang cocok dengan preferensi kamu',
                variations: []
            })
        }

        res.json({
            message: `Ditemukan ${variations.length} variasi jadwal`,
            total_sks: variations[0].reduce((sum, slot) => sum + slot.credits, 0),
            variations
        })

    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server error' })
    }
}

// Simpan jadwal pilihan sebagai draft
const saveDraft = async (req, res) => {
    const { name, slots } = req.body

    if (!name || !slots || !Array.isArray(slots) || slots.length === 0) {
        return res.status(400).json({ message: 'name dan slots harus diisi' })
    }

    try {
        // Buat new schedule
        const scheduleResult = await pool.query(
            `INSERT INTO schedules (user_id, name, status)
             VALUES ($1, $2, 'draft')
             RETURNING *`,
            [req.userId, name]
        )

        const schedule = scheduleResult.rows[0]

        // Insert evry slor to schedudle_items
        for (const slotId of slots) {
            await pool.query(
                `INSERT INTO schedule_items (schedule_id, class_slot_id)
                 VALUES ($1, $2)`,
                [schedule.id, slotId]
            )
        }

        res.status(201).json({
            message: 'Draft jadwal berhasil disimpan',
            schedule
        })

    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server error' })
    }
}

// draft jadwal
const getMySchedules = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT s.*, 
                json_agg(
                    json_build_object(
                        'slot_id', cs.id,
                        'course_name', c.name,
                        'code', c.code,
                        'credits', c.credits,
                        'class_name', cs.class_name,
                        'day', cs.day,
                        'start_time', cs.start_time,
                        'end_time', cs.end_time,
                        'room', cs.room,
                        'lecturer', cs.lecturer
                    )
                ) as slots
             FROM schedules s
             JOIN schedule_items si ON s.id = si.schedule_id
             JOIN class_slots cs ON si.class_slot_id = cs.id
             JOIN courses c ON cs.course_id = c.id
             WHERE s.user_id = $1
             GROUP BY s.id
             ORDER BY s.created_at DESC`,
            [req.userId]
        )

        res.json({ schedules: result.rows })

    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server error' })
    }
}

// DELETE draft jadwal
const deleteDraft = async (req, res) => {
    const { id } = req.params

    try {
        const check = await pool.query(
            'SELECT id FROM schedules WHERE id = $1 AND user_id = $2',
            [id, req.userId]
        )

        if (check.rows.length === 0) {
            return res.status(404).json({ message: 'Jadwal tidak ditemukan' })
        }

        await pool.query('DELETE FROM schedule_items WHERE schedule_id = $1', [id])

        await pool.query('DELETE FROM schedules WHERE id = $1', [id])

        res.json({ message: 'Draft jadwal berhasil dihapus' })

    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server error' })
    }
}

module.exports = { generate, saveDraft, getMySchedules,deleteDraft}