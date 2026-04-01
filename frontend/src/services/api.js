import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5001/api', // Adjust if backend runs on different port
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (user && user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        } else {
            // Fallback for different storage key if needed, or bare token
            const token = localStorage.getItem('token');
            if (token) config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
