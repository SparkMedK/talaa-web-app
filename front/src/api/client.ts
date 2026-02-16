import axios from 'axios';

// Base URL configuration - utilizing Vite's import.meta.env logic or fallback
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add x-user-id header to every request if available
apiClient.interceptors.request.use((config) => {
    const userId = localStorage.getItem('userId');
    if (userId) {
        config.headers['x-user-id'] = userId;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});
