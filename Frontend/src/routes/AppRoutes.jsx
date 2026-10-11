import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../features/auth/pages/Login";
import Register from "../features/auth/pages/Register";
import { useAuth } from "../features/auth/hooks/useAuth";
import LoadingSpinner from "../components/LoadingSpinner";
import Unauthorized from "../features/auth/pages/Unauthorized";
import ProtectedRoute from "./ProtectedRoute";
import StudentDashboard from "../features/student/Dashboard";
import FacultyDashboard from "../features/faculty/FacultyDashboard";
import AdminDashboard from "../features/admin/AdminDashboard";
const AppRoutes = () => {
  const { loading } = useAuth();
  if (loading) {
    return <LoadingSpinner />;
  }
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute allowedRoles={["STUDENT"]}>
            <StudentDashboard/>
          </ProtectedRoute>
        }
      />

      <Route
        path="/faculty/schedule"
        element={
          <ProtectedRoute allowedRoles={["FACULTY"]}>
            <FacultyDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};

export default AppRoutes;
