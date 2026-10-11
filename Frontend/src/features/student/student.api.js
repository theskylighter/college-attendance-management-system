import api from "../../lib/axios";

export const getAttendanceSummary = () => api.get("/student/attendance");

export const getAttendanceBySubject = (subjectId) =>
  api.get(`/student/attendance/${subjectId}`);

export const raiseCorrection = (attendanceRecordId, reason) =>
  api.post("/student/corrections", { attendanceRecordId, reason });

export const escalateCorrection = (correctionId, reason) =>
  api.post(`/student/corrections/${correctionId}/escalate`, { reason });

export const getMyCorrections = () => api.get("/student/corrections");

export const getCourses = () => {
  return api.get("/student/courses");
};
export const getSchedule = () => {
  return api.get("/student/schedule");
};
