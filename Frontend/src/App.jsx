import { AuthProvider } from "./features/auth/auth.context";
import AppRoutes from "./routes/AppRoutes";
import { BrowserRouter } from "react-router-dom";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
