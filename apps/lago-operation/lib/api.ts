import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：添加token
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('operation_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// 响应拦截器：处理错误
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token过期，清除本地存储
      if (typeof window !== 'undefined') {
        localStorage.removeItem('operation_token');
        localStorage.removeItem('operation_staff');
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

