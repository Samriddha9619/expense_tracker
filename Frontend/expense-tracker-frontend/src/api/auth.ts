import api from './axios';
import { AuthResponse, LoginData, RegisterData, User } from '../types';

export const authAPI = {
  // Register new user
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register/', data);
    return response.data;
  },

  // Login user
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post('/auth/login/', data);
    return response.data;
  },

  // Logout user
  logout: async (refreshToken: string): Promise<void> => {
    await api.post('/auth/logout/', { refresh_token: refreshToken });
  },

  // Get user profile
  getProfile: async (): Promise<User> => {
    const response = await api.get('/auth/profile/');
    return response.data;
  },

  // Update user profile
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.put('/auth/profile/', data);
    return response.data;
  },

  // Change password
  changePassword: async (data: {
    old_password: string;
    new_password: string;
    new_password_confirm: string;
  }): Promise<{ message: string }> => {
    const response = await api.put('/auth/change-password/', data);
    return response.data;
  },
};
