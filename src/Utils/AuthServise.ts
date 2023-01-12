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

// test admin access

export const getIsAdmin = (): boolean => {
  return localStorage.getItem('isAdmin')?.toLowerCase() === 'true';
}

export const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

export const authorize = async (loginModel: LoginModel): Promise<boolean> => {
  const client = GetApiClient();;
  try {
    const response = await client.login(loginModel);
    console.log(JSON.stringify(response));
    if (response.success) {
      localStorage.setItem('token', response.data?.token ?? '');
      localStorage.setItem('isAdmin', response.data?.isAdmin?.toString() ?? 'false');
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
