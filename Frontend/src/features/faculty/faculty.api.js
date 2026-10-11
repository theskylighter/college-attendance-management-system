import api from '../../lib/axios';

export const getFacultySchedule = () => api.get('/faculty/schedule');

export const getSessionStudents = (sessionId) => api.get(`/faculty/sessions/${sessionId}`);

export const bulkMarkAttendance = (lectureSessionId, records) =>
  api.post('/faculty/attendance/bulk-mark', { lectureSessionId, records });

export const getPendingCorrections = () => api.get('/faculty/corrections');

export const decideCorrection = (id, decision) =>
  api.put(`/faculty/corrections/${id}`, { decision });
