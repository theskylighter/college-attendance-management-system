const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/

function parseTime(value) {
  if (typeof value !== 'string' || !TIME_PATTERN.test(value)) {
    throw new Error('Time must use HH:MM format.')
  }

  const [hours, minutes] = value.split(':').map(Number)
  return hours * 60 + minutes
}

function validateTimeRange(startTime, endTime) {
  const startMinutes = parseTime(startTime)
  const endMinutes = parseTime(endTime)

  if (startMinutes >= endMinutes) {
    throw new Error('startTime must be before endTime.')
  }

  return { startMinutes, endMinutes }
}

function rangesOverlap(startA, endA, startB, endB) {
  const rangeA = validateTimeRange(startA, endA)
  const rangeB = validateTimeRange(startB, endB)
  return rangeA.startMinutes < rangeB.endMinutes && rangeB.startMinutes < rangeA.endMinutes
}

module.exports = {
  parseTime,
  validateTimeRange,
  rangesOverlap
}
