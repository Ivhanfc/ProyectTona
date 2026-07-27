import axios from 'axios';

// Get base URL from environment variables or fallback to a standard development address
const SERVER_URL = process.env.EXPO_PUBLIC_URLSERVER || 'http://192.168.1.73:8000';

// Handle some common port errors or trailing slashes
const cleanUrl = SERVER_URL.replace('80000', '8000').replace(/\/$/, '');

const api = axios.create({
    baseURL: `${cleanUrl}/api/v1`,
    timeout: 8000,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
