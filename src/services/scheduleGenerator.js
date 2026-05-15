const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number)
    return hours * 60 + minutes
}

const hasTimeConflict = (newSlot, currentSchedule) => {
    for (const slot of currentSchedule) {
        if (slot.day === newSlot.day) {
            const newStart = timeToMinutes(newSlot.start_time)
            const newEnd = timeToMinutes(newSlot.end_time)
            const existStart = timeToMinutes(slot.start_time)
            const existEnd = timeToMinutes(slot.end_time)

            
            if (newStart < existEnd && newEnd > existStart) {
                return true
            }
        }
    }
    return false
}


const hasGapViolation = (newSlot, currentSchedule, maxGapMinutes) => {
    const sameDay = currentSchedule.filter(s => s.day === newSlot.day)

    const newStart = timeToMinutes(newSlot.start_time)
    const newEnd = timeToMinutes(newSlot.end_time)

    for (const slot of sameDay) {
        const existStart = timeToMinutes(slot.start_time)
        const existEnd = timeToMinutes(slot.end_time)

        
        const gap1 = newStart - existEnd
        
        const gap2 = existStart - newEnd

        if (gap1 > 0 && gap1 > maxGapMinutes) return true
        if (gap2 > 0 && gap2 > maxGapMinutes) return true
    }
    return false
}


const backtrack = (slotsByCoourse, preferences, currentSchedule, courseIndex, results) => {
    if (results.length >= 5) return

    if (courseIndex === slotsByCoourse.length) {
        results.push([...currentSchedule])
        return
    }

    const currentSlots = slotsByCoourse[courseIndex]

    for (const slot of currentSlots) {
        if (!preferences.allowed_days.includes(slot.day)) continue

        if (timeToMinutes(slot.end_time) > timeToMinutes(preferences.latest_end_time)) continue

        if (hasTimeConflict(slot, currentSchedule)) continue

        if (hasGapViolation(slot, currentSchedule, preferences.max_gap_minutes)) continue

        currentSchedule.push(slot)
        backtrack(slotsByCoourse, preferences, currentSchedule, courseIndex + 1, results)
        currentSchedule.pop()
    }
}


const generateSchedules = (slotsByCourse, preferences) => {
    const results = []
    backtrack(slotsByCourse, preferences, [], 0, results)
    return results
}

module.exports = { generateSchedules, timeToMinutes }