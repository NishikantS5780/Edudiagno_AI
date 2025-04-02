import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await api.post('/auth/refresh', { refresh_token: refreshToken });
          const { access_token, refresh_token } = response.data;
          
          // Update tokens in localStorage
          localStorage.setItem('token', access_token);
          localStorage.setItem('refreshToken', refresh_token);

          // Update the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, logout the user
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    if (error.response?.status === 403) {
      window.location.href = '/unauthorized';
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (email: string, password: string) => {
    // Create form data for OAuth2 password flow
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    const { access_token, refresh_token, ...userData } = response.data;
    localStorage.setItem('token', access_token);
    localStorage.setItem('refreshToken', refresh_token);
    localStorage.setItem('user', JSON.stringify(userData));
    
    return response.data;
  },
  register: async (userData: any) => {
    try {
      // Split the name into first_name and last_name
      const [first_name, ...lastNameParts] = userData.name.split(' ');
      const last_name = lastNameParts.join(' ') || ''; // Ensure last_name is never null

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        throw new Error('Invalid email format');
      }

      // Validate password length
      if (userData.password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      const response = await api.post('/auth/register', {
        email: userData.email.trim(),
        password: userData.password,
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        company_name: userData.companyName.trim(),
        company_logo: null,
        phone: null,
        website: null,
        industry: null,
        company_size: null
      });
      const { access_token, refresh_token } = response.data;
      localStorage.setItem('token', access_token);
      localStorage.setItem('refreshToken', refresh_token);
      return response.data;
    } catch (error: any) {
      // Log the error details for debugging
      console.error('Registration error details:', error.response?.data);
      
      // If the error is from the API, throw it with the original message
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      
      // For other errors, throw a generic message
      throw new Error('Failed to create account. Please try again.');
    }
  },
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token available');
    
    const response = await api.post('/auth/refresh', { refresh_token: refreshToken });
    const { access_token, refresh_token } = response.data;
    localStorage.setItem('token', access_token);
    localStorage.setItem('refreshToken', refresh_token);
    return response.data;
  },
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/';  // Redirect to landing page instead of login
    }
  },
};

export const userAPI = {
  updateProfile: async (data: any) => {
    const response = await api.put('/users/me', data);
    return response.data;
  },
};

export const jobAPI = {
  getAll: () => api.get("/jobs"),
  create: (data: any) => api.post("/jobs", data),
  getById: (id: string) => api.get(`/jobs/${id}`),
  delete: (id: number) => api.delete(`/jobs/${id}`),
  getStats: (id: number) => api.get(`/jobs/${id}/stats`),
  createCandidate: (data: any) => api.post("/candidates", data),
  createInterview: async (data: { job_id: number; candidate_id: number; scheduled_at: string | null }) => {
    const response = await api.post("/interviews", data);
    return response;
  },
};

export const interviewAPI = {
  create: async (data: any) => {
    const response = await api.post('/interviews', data);
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/interviews/${id}`);
    return response.data;
  },
  getByAccessCode: (accessCode: string) => api.get(`/interviews/by-access-code/${accessCode}`),
};

export const videoAPI = {
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/videos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default api; 