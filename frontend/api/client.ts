import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { API_BASE } from '../src/global';
import { getCookie } from '../src/functions/cookies';
const API_BASE_URL = API_BASE;

let $$retry: boolean = false;
const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
client.interceptors.request.use(async (config: AxiosRequestConfig) => {
  try {
    const token = getCookie('token');
    console.log(token);
    config.headers['Authorization'] = `Bearer ${token}`;
  } catch (e) {
    //
  }
  return config;
});
client.interceptors.response.use(
  (response) => {
    return response;
  },
  async function (error: AxiosError) {
    const { response } = error;
    const requestConfig: AxiosRequestConfig = error.config;

    if (response?.status === 401 && !$$retry) {
      const refresh = getCookie('token');

      if (refresh === null) {
        return Promise.reject(error);
      }

      $$retry = true;

      // const tokenResponse = await Auth.refresh({ refresh });
      // const newToken = tokenResponse.data.access;
      // await AsyncStorage.setItem('RUNTHE_ACCESS_TOKEN', newToken);

      // requestConfig.headers['Authorization'] = `Bearer ${newToken}`;
      return client(requestConfig);
    } else if ($$retry) {
      // TODO: force redirection
    }
    return Promise.reject(error);
  }
);
export default client;
