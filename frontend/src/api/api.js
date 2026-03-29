import axios from "axios";

// 🔥 AUTO SWITCH BETWEEN LOCAL + PRODUCTION
const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://tug-of-war-backend-wmde.onrender.com/api" // ✅ include /api
    : "http://localhost:5000/api"; // ✅ local dev

const API = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔐 Attach JWT token automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ⚠️ OPTIONAL: Handle expired tokens globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("🔒 Unauthorized - logging out");
      localStorage.removeItem("token");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default API;
