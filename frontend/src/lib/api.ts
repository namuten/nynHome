import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically add JWT token
api.interceptors.request.use((config) => {
  try {
    const authDataString = localStorage.getItem('crochub.auth');
    if (authDataString) {
      const authData = JSON.parse(authDataString);
      if (authData?.token) {
        config.headers.Authorization = `Bearer ${authData.token}`;
      }
    }
  } catch (err) {
    console.error('Failed to parse auth token from localStorage', err);
  }
  return config;
});

// Response interceptor to format errors standardly
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // The server responded with a status code outside the 2xx range
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      return Promise.reject({ code: 'NETWORK_ERROR', message: '네트워크 연결 상태를 확인해주세요.' });
    } else {
      // Something happened in setting up the request that triggered an Error
      return Promise.reject({ code: 'REQUEST_ERROR', message: error.message });
    }
  }
);
export default api;
