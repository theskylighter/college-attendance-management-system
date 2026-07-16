import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./features/auth/auth.context";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register/>} />

          <Route
            path="/student/dashboard"
            element={<div>Student Dashboard (placeholder)</div>}
          />

          <Route
            path="/faculty/schedule"
            element={<div>Faculty Schedule (placeholder)</div>}
          />

          <Route
            path="/admin/dashboard"
            element={<div>Admin Dashboard (placeholder)</div>}
          />

          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
