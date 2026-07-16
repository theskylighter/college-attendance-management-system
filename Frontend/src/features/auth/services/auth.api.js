import api from "../../../lib/axios";

// register
export async function register({ fullName, email, role, password }) {
    const response = await api.post("/api/auth/register", {
      name: fullName,
      email,
      password,
      role,
    });
    return response.data;

}

// login
export async function login({ email, password }) {
  const response = await api.post("/api/auth/login", { email, password });
  return response.data;
}
// getme
export async function getme() {
  try {
    const response = await api.get("/api/auth/me");
    if (response) return response.data;
  } catch (err) {
    console.log(err);
  }
}
// logout
export async function logout({ email, password }) {
 
    const response = await api.post("/api/auth/logout");
    return response.data;
    
  
}
