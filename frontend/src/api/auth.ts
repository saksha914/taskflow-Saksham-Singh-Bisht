import client from './client';
import { AuthResponse } from '../types';

export const authApi = {
  register(name: string, email: string, password: string) {
    return client.post<AuthResponse>('/auth/register', { name, email, password });
  },
  login(email: string, password: string) {
    return client.post<AuthResponse>('/auth/login', { email, password });
  },
};
