import axios from 'axios';
const api = axios.create({
  baseURL: "https://localhost:7020/api",
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
