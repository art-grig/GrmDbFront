import axios from 'axios';
import { getAuthToken, isLoggedIn } from './AuthServise';
import { ApiUrl } from './config';

export function enableAuthInterceptor() {
  axios.interceptors.request.use(request => {
    console.log('interceptor');
    // add auth header with jwt if account is logged in and request is to the api url
    const authToken = getAuthToken();
    const isApiUrl = !ApiUrl ? !request!.url!.startsWith('http') : request!.url!.startsWith(ApiUrl);

    if (isLoggedIn() && isApiUrl) {
      //@ts-ignore
      request!.headers!.Authorization = `Bearer ${authToken}`;
    }

    return request;
  });
}