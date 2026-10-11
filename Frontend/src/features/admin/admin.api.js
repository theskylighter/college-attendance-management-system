import api from '../../lib/axios';

export async function getRooms() {
  const response = await api.get('/admin/rooms');
  return response.data;
}

export async function createRoom(payload) {
  const response = await api.post('/admin/rooms', payload);
  return response.data;
}

export async function updateRoom(id, payload) {
  const response = await api.put(`/admin/rooms/${id}`, payload);
  return response.data;
}

export async function deleteRoom(id) {
  const response = await api.delete(`/admin/rooms/${id}`);
  return response.data;
}

export async function getEscalatedCorrections() {
  const response = await api.get('/admin/corrections/escalated');
  return response.data;
}

export async function decideEscalation(id, decision) {
  const response = await api.put(`/admin/corrections/${id}/decision`, { decision });
  return response.data;
}

const list = (path, params) => api.get(path, { params });

export const getDepartments = (params) => list('/admin/departments', params);
export const createDepartment = (payload) => api.post('/admin/departments', payload);
export const updateDepartment = (id, payload) => api.put(`/admin/departments/${id}`, payload);
export const deleteDepartment = (id) => api.delete(`/admin/departments/${id}`);

export const getSections = (params) => list('/admin/sections', params);
export const createSection = (payload) => api.post('/admin/sections', payload);
export const updateSection = (id, payload) => api.put(`/admin/sections/${id}`, payload);
export const deleteSection = (id) => api.delete(`/admin/sections/${id}`);

export const getSubjects = (params) => list('/admin/subjects', params);
export const createSubject = (payload) => api.post('/admin/subjects', payload);
export const updateSubject = (id, payload) => api.put(`/admin/subjects/${id}`, payload);
export const deleteSubject = (id) => api.delete(`/admin/subjects/${id}`);

export const getFaculty = (params) => list('/admin/faculty', params);
export const createFaculty = (payload) => api.post('/admin/faculty', payload);
export const getStudents = (params) => list('/admin/students', params);
export const createStudent = (payload) => api.post('/admin/students', payload);

export const getSectionSubjects = (params) => list('/admin/section-subjects', params);
export const assignFacultyToSubject = (payload) => api.post('/admin/section-subjects', payload);
export const removeSectionSubject = (id) => api.delete(`/admin/section-subjects/${id}`);

export const getTimetableSlots = (params) => list('/admin/timetable/slots', params);
export const createTimetableSlot = (payload) => api.post('/admin/timetable/slots', payload);
export const deleteTimetableSlot = (id) => api.delete(`/admin/timetable/slots/${id}`);
export const generateLectureSessions = (payload) => api.post('/admin/timetable/generate-sessions', payload);

export const getAttendanceSummaryReport = (params) => api.get('/admin/reports/summary', { params });
export const getDefaultersReport = (params) => api.get('/admin/reports/defaulters', { params });
export const exportAttendanceReport = (format, params) =>
  api.get(`/admin/reports/export/${format}`, { params, responseType: 'blob' });
