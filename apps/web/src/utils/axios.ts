import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5001',  // Make sure this matches your backend port
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default axiosInstance;