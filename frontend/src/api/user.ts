import client from './client';
import { User } from '../types';

export const userApi = {
  list() {
    return client.get<User[]>('/users');
  },
};
