import { createContext, useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login, register, getme, logout } from "./services/auth.api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // handleLogin controller
 const handleLogin = async ({email, password}) => {
    
   setLoading(true)
    const data = await login({ email, password });
    setUser(data.user);
    setLoading(false)
    
    return data.user.role;
  };

  // handleRegister controller
  const handleRegister = async({ fullName, email, password, role, profileData }) => {
    setLoading(true);
    // call the actual api from auth.api.js
    const data = await register({ fullName, email, password, role, profileData });
    setLoading(false);
  };

  // handleLogout controller
  const handleLogout = async() => {
    setLoading(true);
    // call the actual api from auth.api.js
    const data = await logout();
    setLoading(false);
  };

  // fetch user details to check if already logged in
  useEffect(() => {
    const getAndSetUser = async () => {
      try {
        const data = await getme();
        if(data.user) {
          console.log("setting user as:",data.user)
          setUser(data.user);
          if(data.user.role ==='STUDENT'){
            navigate("/student/dashboard")
          }
          else if(data.user.role ==='FACULTY'){
            navigate("/faculty/schedule")
          }
          else
            navigate("/admin/dashboard")
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    getAndSetUser();
  
  }, []);

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
