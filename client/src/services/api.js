import axios from "axios";

const rawUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:7000/api").trim().replace(/\/+$/, "");
const API_BASE_URL = rawUrl.endsWith("/api") ? rawUrl : `${rawUrl}/api`;

export const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

export default api;
