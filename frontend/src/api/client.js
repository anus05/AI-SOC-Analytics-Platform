import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

let tokenGetter = () => null;

/**
 * Register a function to retrieve the current token from memory.
 * This is used to attach the Bearer token dynamically on each request.
 */
export const registerTokenGetter = (getter) => {
  tokenGetter = getter;
};

client.interceptors.request.use(
  (config) => {
    const token = tokenGetter();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      window.dispatchEvent(new Event('auth-unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default client;
