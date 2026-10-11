async function createCorrectionEvent(tx, data) {
  return tx.correctionEvent.create({
    data: {
      correctionRequestId: data.correctionRequestId,
      attendanceRecordId: data.attendanceRecordId,
      actorId: data.actorId,
      action: data.action,
      previousStatus: data.previousStatus || null,
      newStatus: data.newStatus || null,
      reason: data.reason || null
    }
  })
}

module.exports = { createCorrectionEvent }
