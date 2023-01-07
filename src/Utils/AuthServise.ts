import axios from 'axios';
import { ApiUrl, GetApiClient } from './config';
import { Client, LoginModel } from '../apiClients';

export const isLoggedIn = (): boolean => {
  if (localStorage.getItem('token')) {
    return true;
  } else {
    return false;
  }
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

export const authorize = async (loginModel: LoginModel): Promise<boolean> => {
  const client = GetApiClient();;
  try {
    const response = await client.login(loginModel);
    if (response.success) {
      localStorage.setItem('token', response.data?.token ?? '');
      return true;
    }
    else {
      return false;
    }
  } catch (ex: any) {
    // какой то код
    return false;
  }
};

export const logout = async () => {
  localStorage.removeItem('token');
};
