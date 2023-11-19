import axios, { type AxiosRequestConfig } from 'axios';
import config from '@/config';

const request = axios.create({
  baseURL: config.apiBasePath,
  transformResponse: [data => {
    console.log(data);
    return JSON.parse(data, dateReviver);
  }],
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const errorHandler = (error: any) => {
  let message = '';
  if (error.response) {
    const { data } = error.response;
    message += data?.message;
  }
  window.$dialog.error({
    title: 'Error Occurred',
    content: 'Error Occurred' + (message ? ',' + message :  '.'),
  });
};

request.interceptors.response.use((response) => response.data, errorHandler);

const api = (req: AxiosRequestConfig<unknown>) => new Promise((resolve, reject) => {
  request(req).then((resp) => {
    console.log(resp);
    resolve(resp);
  }).catch((err) => {
    window.$dialog.error({
      title: 'Error Occurred',
      content: 'Error Occurred' + (err.message ? ',' + err.message :  '.'),
    });
    reject(err);
  });
});

// Custom reviver function to convert date strings to Date objects
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const dateReviver = (key: string, value: any) => {
  if (typeof value === 'string' && key.endsWith('_at')) {
    const date = new Date(value);
    if (!isNaN(date.getTime()) && Number(value).toString() !== value) {
      return date;
    }
  }
  return value;
};

export default api;
