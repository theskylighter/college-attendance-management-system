import api from "../../../lib/axios";

// register
export async function register({ fullName, email, role, password, profileData }) {
    const response = await api.post("/auth/register", {
      name: fullName,
      email,
      password,
      role,
      ...profileData
    });
    return response.data;

}

// login
export async function login({ email, password }) {
  const response = await api.post("/auth/login", { email, password });
  return response.data;
}
// getme
export async function getme() {
  try {
    const response = await api.get("/auth/me");
    return response?.data ?? null;
  } catch (err) {
    console.log(err);
    return null;
  }
}
// logout
export async function logout() {
 
    const response = await api.post("/auth/logout");
    return response.data;
    
  
}
