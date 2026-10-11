/* eslint-disable react-refresh/only-export-components */

import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getme, login, logout, register } from "./services/auth.api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleLogin = async ({ email, password }) => {
    setLoading(true);
    const data = await login({ email, password });
    setUser(data.user);
    setLoading(false);

    return data.user.role;
  };

  const handleRegister = async ({ fullName, email, password, role, profileData }) => {
    setLoading(true);
    await register({ fullName, email, password, role, profileData });
    setLoading(false);
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
    } finally {
      setUser(null);
      setLoading(false);
      navigate("/login");
    }
  };

  useEffect(() => {
    const getAndSetUser = async () => {
      try {
        const data = await getme();
        if (!data?.user) {
          return;
        }

        setUser(data.user);

        if (data.user.role === "STUDENT") {
          navigate("/student/dashboard");
        } else if (data.user.role === "FACULTY") {
          navigate("/faculty/schedule");
        } else {
          navigate("/admin/dashboard");
        }
      } finally {
        setLoading(false);
      }
    };

    void getAndSetUser();
  }, [navigate]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        setLoading,
        setUser,
        handleLogin,
        handleRegister,
        handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
